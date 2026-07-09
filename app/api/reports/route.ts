import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import User from "@/models/User";
import { getAuthUserFromRequest } from "@/lib/jwt";

type CreateReportBody = {
  targetUserId?: string;
  targetUserName?: string;
  category?: "스팸" | "사칭" | "욕설" | "성희롱" | "부적절한 콘텐츠" | "기타";
  reason?: string;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function serializeReport(report: any) {
  return {
    id: String(report._id),

    reporterId: report.reporterId,
    reporterName: report.reporterName,
    reporterEmail: report.reporterEmail,

    targetUserId: report.targetUserId,
    targetUserName: report.targetUserName,

    category: report.category,
    reason: report.reason,
    status: report.status,

    adminMemo: report.adminMemo || "",
    processedBy: report.processedBy || "",
    processedAt: report.processedAt || null,

    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function getLoggedInUser(request: Request) {
  const authUser = getAuthUserFromRequest(request);

  if (!authUser?.userId) {
    return null;
  }

  const user = await User.findById(authUser.userId).lean();

  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.nickname || user.name || "insai 유저",
    email: user.email || "",
    role: user.role || "user",
  };
}

export async function GET() {
  try {
    await connectDB();

    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    return NextResponse.json({
      ok: true,
      reports: reports.map(serializeReport),
    });
  } catch (error) {
    console.error("Reports GET error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "신고 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getLoggedInUser(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateReportBody;

    const targetUserId = normalizeText(body.targetUserId);
    const targetUserName = normalizeText(body.targetUserName);
    const category = normalizeText(body.category);
    const reason = normalizeText(body.reason);

    const allowedCategories = [
      "스팸",
      "사칭",
      "욕설",
      "성희롱",
      "부적절한 콘텐츠",
      "기타",
    ];

    if (!targetUserId || !targetUserName) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고 대상 정보가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          ok: false,
          message: "올바르지 않은 신고 유형입니다.",
        },
        { status: 400 }
      );
    }

    if (reason.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고 사유를 2글자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const report = await Report.create({
      reporterId: user.id,
      reporterName: user.name,
      reporterEmail: user.email,

      targetUserId,
      targetUserName,

      category,
      reason,
      status: "대기",

      adminMemo: "",
      processedBy: "",
      processedAt: null,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "신고가 정상적으로 접수되었습니다.",
        report: serializeReport(report),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reports POST error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "신고 접수 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
