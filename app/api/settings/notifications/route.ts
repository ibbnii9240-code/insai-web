import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/jwt";
import NotificationSetting from "@/models/NotificationSetting";
import User from "@/models/User";

type NotificationSettings = {
  allNotifications: boolean;

  communityEnabled: boolean;
  follow: boolean;
  postLike: boolean;
  comment: boolean;
  communityMessage: boolean;
  friendRequest: boolean;

  datingEnabled: boolean;
  match: boolean;
  datingMessage: boolean;
  datingLike: boolean;

  supportEnabled: boolean;
  inquiryReply: boolean;
  reportResult: boolean;

  marketing: boolean;
};

type UpdateBody = {
  appUserId?: string;
  settings?: Partial<NotificationSettings>;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  allNotifications: true,

  communityEnabled: true,
  follow: true,
  postLike: true,
  comment: true,
  communityMessage: true,
  friendRequest: true,

  datingEnabled: true,
  match: true,
  datingMessage: true,
  datingLike: true,

  supportEnabled: true,
  inquiryReply: true,
  reportResult: true,

  marketing: false,
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeSettings(
  value?: Partial<NotificationSettings> | null
): NotificationSettings {
  const source = value || {};

  return {
    allNotifications: normalizeBoolean(
      source.allNotifications,
      DEFAULT_SETTINGS.allNotifications
    ),

    communityEnabled: normalizeBoolean(
      source.communityEnabled,
      DEFAULT_SETTINGS.communityEnabled
    ),
    follow: normalizeBoolean(source.follow, DEFAULT_SETTINGS.follow),
    postLike: normalizeBoolean(
      source.postLike,
      DEFAULT_SETTINGS.postLike
    ),
    comment: normalizeBoolean(
      source.comment,
      DEFAULT_SETTINGS.comment
    ),
    communityMessage: normalizeBoolean(
      source.communityMessage,
      DEFAULT_SETTINGS.communityMessage
    ),
    friendRequest: normalizeBoolean(
      source.friendRequest,
      DEFAULT_SETTINGS.friendRequest
    ),

    datingEnabled: normalizeBoolean(
      source.datingEnabled,
      DEFAULT_SETTINGS.datingEnabled
    ),
    match: normalizeBoolean(source.match, DEFAULT_SETTINGS.match),
    datingMessage: normalizeBoolean(
      source.datingMessage,
      DEFAULT_SETTINGS.datingMessage
    ),
    datingLike: normalizeBoolean(
      source.datingLike,
      DEFAULT_SETTINGS.datingLike
    ),

    supportEnabled: normalizeBoolean(
      source.supportEnabled,
      DEFAULT_SETTINGS.supportEnabled
    ),
    inquiryReply: normalizeBoolean(
      source.inquiryReply,
      DEFAULT_SETTINGS.inquiryReply
    ),
    reportResult: normalizeBoolean(
      source.reportResult,
      DEFAULT_SETTINGS.reportResult
    ),

    marketing: normalizeBoolean(
      source.marketing,
      DEFAULT_SETTINGS.marketing
    ),
  };
}

async function getLoggedInWebUser(request: Request) {
  const authUser = getAuthUserFromRequest(request);

  if (!authUser?.userId) {
    return null;
  }

  return User.findById(authUser.userId).lean();
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const webUser = await getLoggedInWebUser(request);

    if (!webUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const webUserId = String((webUser as any)._id);
    const appUserId = normalizeText((webUser as any).appUserId);

    const existing = await NotificationSetting.findOne({
      $or: [
        { webUserId },
        ...(appUserId ? [{ appUserId }] : []),
      ],
    }).lean();

    return NextResponse.json({
      ok: true,
      settings: normalizeSettings(
        existing?.settings as Partial<NotificationSettings>
      ),
      appUserId,
      webUserId,
    });
  } catch (error) {
    console.error("Notification settings GET error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "알림 설정을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();

    const webUser = await getLoggedInWebUser(request);

    if (!webUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateBody;
    const webUserId = String((webUser as any)._id);
    const appUserId =
      normalizeText((webUser as any).appUserId) ||
      normalizeText(body.appUserId);

    const settings = normalizeSettings(body.settings);

    const saved = await NotificationSetting.findOneAndUpdate(
      {
        webUserId,
      },
      {
        $set: {
          webUserId,
          appUserId,
          settings,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      ok: true,
      message: "알림 설정이 저장되었습니다.",
      settings: normalizeSettings(
        saved?.settings as Partial<NotificationSettings>
      ),
      appUserId,
      webUserId,
    });
  } catch (error) {
    console.error("Notification settings PATCH error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "알림 설정 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}