import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateReportBody = {
  status?: "대기" | "확인중" | "완료" | "반려";
  adminNote?: string;
};

const allowedStatuses = ["대기", "확인중", "완료", "반려"];

function mapWebStatusToAppStatus(
  status?: "대기" | "확인중" | "완료" | "반려"
) {
  if (status === "확인중") return "REVIEWING";
  if (status === "완료") return "APPROVED";
  if (status === "반려") return "REJECTED";
  return "PENDING";
}

function serializeReport(report: any) {
  return {
    id: String(report._id),

    // Railway Prisma Report와 연결되는 실제 신고 ID
    appReportId: report.appReportId || "",

    reporterName: report.reporterName || "",
    reporterEmail: report.reporterEmail || "",
    reporterId: report.reporterId || "",

    reportedUserId: report.reportedUserId || "",
    reportedNickname: report.reportedNickname || "",

    category: report.category || "신고",
    reason: report.reason || "",
    message: report.message || "",

    postId: report.postId || "",
    chatRoomId: report.chatRoomId || "",
    messageId: report.messageId || "",

    status: report.status || "대기",
    adminNote: report.adminNote || "",
    processedAt: report.processedAt || null,

    userId: report.userId || "",
    appUserId: report.appUserId || report.userId || report.reporterId || "",
    webUserId: report.webUserId || "",
    source: report.source || "app",
    appVersion: report.appVersion || "",

    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function syncAppReportStatus({
  appReportId,
  status,
}: {
  appReportId: string;
  status: "대기" | "확인중" | "완료" | "반려";
}) {
  const baseUrl = process.env.APP_BACKEND_URL;
  const secret = process.env.WEB_AUTH_SECRET || "";

  if (!baseUrl) {
    throw new Error("APP_BACKEND_URL 환경변수가 설정되지 않았습니다.");
  }

  if (!appReportId) {
    throw new Error("연결된 앱 신고 ID가 없습니다.");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/reports/${appReportId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-web-auth-secret": secret } : {}),
      },
      body: JSON.stringify({
        status: mapWebStatusToAppStatus(status),
      }),
      cache: "no-store",
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "앱 백엔드 신고 상태 동기화에 실패했습니다."
    );
  }

  return result;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const report = await Report.findById(id).lean();

    if (!report) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      report: serializeReport(report),
    });
  } catch (error) {
    console.error("Report GET error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "신고 상세 정보를 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = (await request.json()) as UpdateReportBody;

    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    if (!body.status && typeof body.adminNote !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "변경할 내용이 없습니다.",
        },
        { status: 400 }
      );
    }

    let finalStatus = report.status as
      | "대기"
      | "확인중"
      | "완료"
      | "반려";

    if (body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            ok: false,
            message: "올바르지 않은 상태값입니다.",
          },
          { status: 400 }
        );
      }

      finalStatus = body.status;
    }

    if (typeof body.adminNote === "string") {
      report.adminNote = body.adminNote.trim();

      if (
        !body.status &&
        report.adminNote.length > 0 &&
        report.status === "대기"
      ) {
        finalStatus = "확인중";
      }
    }

    // 앱에서 올라온 신고라면 Railway Prisma Report 상태도 먼저 동기화
    let appSyncSuccess = false;
    let appSyncMessage = "";

    if (report.source === "app" && report.appReportId) {
      try {
        await syncAppReportStatus({
          appReportId: String(report.appReportId),
          status: finalStatus,
        });

        appSyncSuccess = true;
      } catch (syncError) {
        console.error("App report status sync error:", syncError);

        return NextResponse.json(
          {
            ok: false,
            message:
              syncError instanceof Error
                ? syncError.message
                : "앱 신고 상태 동기화에 실패했습니다.",
          },
          { status: 502 }
        );
      }
    } else if (report.source === "app" && !report.appReportId) {
      appSyncMessage =
        "웹 신고 상태는 변경됐지만, 기존 신고에는 App Report ID가 없어 앱 상태는 동기화되지 않았습니다.";
    }

    report.status = finalStatus;

    if (finalStatus === "완료" || finalStatus === "반려") {
      report.processedAt = new Date();
    } else {
      report.processedAt = null;
    }

    await report.save();

    return NextResponse.json({
      ok: true,
      message:
        appSyncMessage ||
        (finalStatus === "반려"
          ? "신고가 반려 처리되었습니다."
          : finalStatus === "완료"
            ? "신고가 완료 처리되었습니다."
            : finalStatus === "확인중"
              ? "신고가 확인중 상태로 변경되었습니다."
              : "신고가 대기 상태로 변경되었습니다."),
      appSyncSuccess,
      appSyncMessage,
      report: serializeReport(report),
    });
  } catch (error) {
    console.error("Report PATCH error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "신고 상태 변경 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const deletedReport = await Report.findByIdAndDelete(id);

    if (!deletedReport) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "신고가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Report DELETE error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "신고 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
