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

function serializeReport(report: any) {
  return {
    id: String(report._id),

    reporterName: report.reporterName || "",
    reporterEmail: report.reporterEmail || "",
    reporterId: report.reporterId || "",

    reportedUserId: report.reportedUserId || "",
    reportedNickname: report.reportedNickname || "",

    category: report.category || "신고",
    reason: report.reason || "",
    message: report.message || "",

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

      report.status = body.status;

      if (body.status === "완료" || body.status === "반려") {
        report.processedAt = new Date();
      }
    }

    if (typeof body.adminNote === "string") {
      report.adminNote = body.adminNote.trim();

      if (report.adminNote.length > 0 && report.status === "대기") {
        report.status = "확인중";
      }
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

    await report.save();

    return NextResponse.json({
      ok: true,
      message: "신고가 수정되었습니다.",
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