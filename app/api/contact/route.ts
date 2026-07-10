import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import User from "@/models/User";
import { getAuthUserFromRequest } from "@/lib/jwt";

type CreateContactBody = {
  name?: string;
  email?: string;
  category?: string;
  message?: string;

  // 앱에서 넘어오는 기존 값
  userId?: string;

  // 웹/앱 계정 연결용 값
  appUserId?: string;
  webUserId?: string;

  source?: string;
  appVersion?: string;
};

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.MAIL_USER;

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeLower(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSource(value: string) {
  const source = normalizeText(value).toLowerCase();

  if (source === "app") return "app";
  if (source === "web") return "web";

  return source || "web";
}

function serializeContact(contact: any) {
  return {
    id: String(contact._id),
    name: contact.name,
    email: contact.email,
    category: contact.category,
    message: contact.message,
    status: contact.status,
    adminReply: contact.adminReply || "",
    repliedAt: contact.repliedAt || null,
    emailSentAt: contact.emailSentAt || null,

    // 기존 앱 문의 호환
    userId: contact.userId || "",

    // 웹/앱 계정 연결
    appUserId: contact.appUserId || contact.userId || "",
    webUserId: contact.webUserId || "",

    source: normalizeSource(contact.source || "web"),
    appVersion: contact.appVersion || "",
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

async function getLoggedInUser(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);

    if (!authUser?.userId) {
      return null;
    }

    return await User.findById(authUser.userId).lean();
  } catch {
    return null;
  }
}

async function sendAdminContactNotification({
  name,
  email,
  category,
  message,
  source,
  appVersion,
  appUserId,
  webUserId,
}: {
  name: string;
  email: string;
  category: string;
  message: string;
  source: string;
  appVersion: string;
  appUserId: string;
  webUserId: string;
}) {
  if (!MAIL_USER || !MAIL_PASS || !OWNER_EMAIL) {
    console.warn("MAIL_USER, MAIL_PASS, or OWNER_EMAIL is missing.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCategory = escapeHtml(category);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeSource = escapeHtml(source);
  const safeAppVersion = escapeHtml(appVersion);
  const safeAppUserId = escapeHtml(appUserId);
  const safeWebUserId = escapeHtml(webUserId);

  await transporter.sendMail({
    from: `"insai 문의 알림" <${MAIL_USER}>`,
    to: OWNER_EMAIL,
    subject: `[insai] 새 문의 접수 - ${category}`,
    text: `
새 문의가 접수되었습니다.

이름: ${name}
이메일: ${email}
문의 유형: ${category}
접수 경로: ${source}
앱 버전: ${appVersion || "-"}
앱 유저 ID: ${appUserId || "-"}
웹 유저 ID: ${webUserId || "-"}

문의 내용:
${message}
    `.trim(),
    html: `
      <div style="font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#f8fbff;padding:28px;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:28px;box-shadow:0 12px 28px rgba(56,139,253,0.12);">
          <h1 style="margin:0;font-size:26px;">insai 새 문의 접수</h1>
          <p style="margin:18px 0 0;color:#475569;line-height:1.7;">관리자 페이지에서 문의 내용을 확인하고 답변할 수 있습니다.</p>
          <div style="margin-top:22px;padding:18px;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;">이름</p>
            <p style="margin:0;font-size:16px;font-weight:800;">${safeName}</p>
          </div>
          <div style="margin-top:12px;padding:18px;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;">이메일</p>
            <p style="margin:0;font-size:16px;font-weight:800;">${safeEmail}</p>
          </div>
          <div style="margin-top:12px;padding:18px;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;">문의 유형</p>
            <p style="margin:0;font-size:16px;font-weight:800;">${safeCategory}</p>
          </div>
          <div style="margin-top:12px;padding:18px;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;">접수 경로</p>
            <p style="margin:0;font-size:16px;font-weight:800;">${safeSource}${safeAppVersion ? ` · ${safeAppVersion}` : ""}</p>
          </div>
          <div style="margin-top:12px;padding:18px;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;">연결 계정</p>
            <p style="margin:0;font-size:14px;font-weight:800;line-height:1.8;">App User ID: ${safeAppUserId || "-"}<br />Web User ID: ${safeWebUserId || "-"}</p>
          </div>
          <div style="margin-top:18px;">
            <p style="margin:0 0 10px;font-size:15px;font-weight:800;">문의 내용</p>
            <div style="padding:18px;border-radius:18px;background:#f1f5f9;line-height:1.8;">
              ${safeMessage || "-"}
            </div>
          </div>
        </div>
      </div>
    `,
  });

  return true;
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const loggedInUser = await getLoggedInUser(request);
    const url = new URL(request.url);

    const queryAppUserId = normalizeText(url.searchParams.get("appUserId"));
    const queryWebUserId = normalizeText(url.searchParams.get("webUserId"));
    const queryEmail = normalizeLower(url.searchParams.get("email"));

    // 로그인 유저 정보도 함께 사용
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
      filters.push({ userId: appUserId }); // 기존 앱 문의 호환
    }

    if (webUserId) {
      filters.push({ webUserId });
    }

    if (email) {
      filters.push({ email });
    }

    const where = filters.length > 0 ? { $or: filters } : {};

    const contacts = await Contact.find(where)
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    return NextResponse.json({
      ok: true,
      contacts: contacts.map(serializeContact),
    });
  } catch (error) {
    console.error("Contact list error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "문의 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = (await request.json()) as CreateContactBody;
    const loggedInUser = await getLoggedInUser(request);

    const bodyName = normalizeText(body.name);
    const bodyEmail = normalizeText(body.email);

    const loggedWebUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? String((loggedInUser as any)._id || "")
        : "";

    const loggedAppUserId =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).appUserId)
        : "";

    const userName =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).nickname) ||
          normalizeText((loggedInUser as any).name)
        : "";

    const userEmail =
      loggedInUser && typeof loggedInUser === "object"
        ? normalizeText((loggedInUser as any).email)
        : "";

    const name = userName || bodyName || "이름 없음";
    const email = userEmail || bodyEmail || "이메일 없음";
    const category = normalizeText(body.category) || "일반 문의";
    const message = normalizeText(body.message);

    // 기존 앱에서 userId로 보내던 값은 앱 유저 ID로 취급
    const legacyUserId = normalizeText(body.userId);
    const appUserId = normalizeText(body.appUserId) || legacyUserId || loggedAppUserId;
    const webUserId = normalizeText(body.webUserId) || loggedWebUserId;

    const source = normalizeSource(body.source || (loggedInUser ? "web" : "app"));
    const appVersion = normalizeText(body.appVersion);

    if (message.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          message: "문의 내용을 2글자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      category,
      message,
      status: "대기",
      adminReply: "",
      repliedAt: null,
      emailSentAt: null,

      // 기존 앱 호환
      userId: legacyUserId || appUserId,

      // 신규 연결 필드
      appUserId,
      webUserId,

      source,
      appVersion,
    });

    let adminEmailSent = false;

    try {
      adminEmailSent = await sendAdminContactNotification({
        name,
        email,
        category,
        message,
        source,
        appVersion,
        appUserId,
        webUserId,
      });
    } catch (emailError) {
      console.error("Admin contact notification failed:", emailError);
    }

    return NextResponse.json(
      {
        ok: true,
        success: true,
        message: "문의가 정상적으로 접수되었습니다.",
        adminEmailSent,
        contact: serializeContact(contact),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact create error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "문의 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}