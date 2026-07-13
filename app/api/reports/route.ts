import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/jwt";
import Report from "@/models/Report";
import User from "@/models/User";

type ReportStatus = "대기" | "확인중" | "완료" | "반려";

type CreateReportBody = {
  appReportId?: string;

  reporterName?: string;
  reporterEmail?: string;
  reporterId?: string;

  reportedUserId?: string;
  reportedNickname?: string;

  category?: string;
  reason?: string;
  message?: string;

  postId?: string;
  chatRoomId?: string;
  messageId?: string;

  postText?: string;
  postImages?: string[];
  postAuthorId?: string;
  postAuthorName?: string;
  postAuthorAvatar?: string;
  postCreatedAt?: string | null;

  userId?: string;
  appUserId?: string;
  webUserId?: string;

  source?: string;
  appVersion?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLower(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeSource(value: unknown) {
  const source = normalizeText(value).toLowerCase();
  if (source === "app") return "app";
  if (source === "web") return "web";
  return source || "app";
}

function normalizeStatus(value: unknown): ReportStatus {
  const status = normalizeText(value);
  if (status === "확인중") return "확인중";
  if (status === "완료") return "완료";
  if (status === "반려") return "반려";
  return "대기";
}

function serializeReport(report: any) {
  return {
    id: String(report._id),
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

    postText: report.postText || "",
    postImages: Array.isArray(report.postImages) ? report.postImages : [],
    postAuthorId: report.postAuthorId || "",
    postAuthorName: report.postAuthorName || "",
    postAuthorAvatar: report.postAuthorAvatar || "",
    postCreatedAt: report.postCreatedAt || null,

    status: normalizeStatus(report.status),
    adminNote: report.adminNote || "",
    processedAt: report.processedAt || null,

    userId: report.userId || "",
    appUserId: report.appUserId || report.userId || report.reporterId || "",
    webUserId: report.webUserId || "",
    source: normalizeSource(report.source || "app"),
    appVersion: report.appVersion || "",

    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function getLoggedInUser(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return null;
    return await User.findById(authUser.userId).lean();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const loggedInUser = await getLoggedInUser(request);
    const url = new URL(request.url);

    const queryAppUserId = normalizeText(url.searchParams.get("appUserId"));
    const queryWebUserId = normalizeText(url.searchParams.get("webUserId"));
    const queryEmail = normalizeLower(url.searchParams.get("email"));

    const loggedWebUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? String((loggedInUser as any)._id || "")
        : "";

    const loggedAppUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).appUserId)
        : "";

    const loggedEmail =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeLower((loggedInUser as any).email)
        : "";

    const appUserId = queryAppUserId || loggedAppUserId;
    const webUserId = queryWebUserId || loggedWebUserId;
    const email = queryEmail || loggedEmail;

    const filters: any[] = [];

    if (appUserId) {
      filters.push({ appUserId });
      filters.push({ userId: appUserId });
      filters.push({ reporterId: appUserId });
    }

    if (webUserId) {
      filters.push({ webUserId });
    }

    if (email) {
      filters.push({ reporterEmail: email });
    }

    const where = filters.length > 0 ? { $or: filters } : {};

    const reports = await Report.find(where)
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    return NextResponse.json({
      ok: true,
      reports: reports.map(serializeReport),
    });
  } catch (error) {
    console.error("Report list error:", error);
    return NextResponse.json(
      { ok: false, message: "신고 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = (await request.json()) as CreateReportBody;
    const loggedInUser = await getLoggedInUser(request);

    const loggedWebUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? String((loggedInUser as any)._id || "")
        : "";

    const loggedAppUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).appUserId)
        : "";

    const loggedEmail =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).email)
        : "";

    const loggedName =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).nickname) ||
          normalizeText((loggedInUser as any).name)
        : "";

    const appReportId = normalizeText(body.appReportId);

    const legacyUserId = normalizeText(body.userId);
    const appUserId =
      normalizeText(body.appUserId) ||
      legacyUserId ||
      normalizeText(body.reporterId) ||
      loggedAppUserId;

    const webUserId = normalizeText(body.webUserId) || loggedWebUserId;

    const reporterName =
      loggedName || normalizeText(body.reporterName) || "insai 사용자";

    const reporterEmail =
      loggedEmail || normalizeLower(body.reporterEmail) || "이메일 없음";

    const reporterId = normalizeText(body.reporterId) || appUserId;
    const reportedUserId = normalizeText(body.reportedUserId);
    const reportedNickname = normalizeText(body.reportedNickname);

    const category = normalizeText(body.category) || "신고";
    const reason = normalizeText(body.reason) || normalizeText(body.message);
    const message = normalizeText(body.message) || reason;

    const postId = normalizeText(body.postId);
    const chatRoomId = normalizeText(body.chatRoomId);
    const messageId = normalizeText(body.messageId);

    const postText = normalizeText(body.postText);
    const postImages = normalizeStringArray(body.postImages);
    const postAuthorId = normalizeText(body.postAuthorId);
    const postAuthorName = normalizeText(body.postAuthorName);
    const postAuthorAvatar = normalizeText(body.postAuthorAvatar);
    const parsedPostCreatedAt = body.postCreatedAt
      ? new Date(body.postCreatedAt)
      : null;

    const source = normalizeSource(body.source);
    const appVersion = normalizeText(body.appVersion);

    if (reason.length < 2) {
      return NextResponse.json(
        { ok: false, message: "신고 내용을 2글자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const report = await Report.create({
      appReportId,

      reporterName,
      reporterEmail,
      reporterId,

      reportedUserId,
      reportedNickname,

      category,
      reason,
      message,

      postId,
      chatRoomId,
      messageId,

      postText,
      postImages,
      postAuthorId,
      postAuthorName,
      postAuthorAvatar,
      postCreatedAt:
        parsedPostCreatedAt &&
        !Number.isNaN(parsedPostCreatedAt.getTime())
          ? parsedPostCreatedAt
          : null,

      status: "대기",
      adminNote: "",
      processedAt: null,

      userId: legacyUserId || appUserId,
      appUserId,
      webUserId,

      source,
      appVersion,
    });

    return NextResponse.json(
      {
        ok: true,
        success: true,
        message: "신고가 정상적으로 접수되었습니다.",
        report: serializeReport(report),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report create error:", error);
    return NextResponse.json(
      { ok: false, message: "신고 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}