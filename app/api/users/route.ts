import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

function normalizeStatus(status: unknown) {
  if (status === "active" || status === "suspended" || status === "deleted") {
    return status;
  }

  return "active";
}

function serializeUser(user: any) {
  return {
    id: String(user._id),
    provider: user.provider || "",
    providerId: user.providerId || "",
    email: user.email || "",
    emailVerified: Boolean(user.emailVerified),
    name: user.name || "",
    nickname: user.nickname || "",
    avatar: user.avatar || "",
    role: user.role || "user",
    status: normalizeStatus(user.status),
    isProfileCompleted: Boolean(user.isProfileCompleted),
    agreedToTerms: Boolean(user.agreedToTerms),
    agreedToPrivacy: Boolean(user.agreedToPrivacy),
    agreedToMarketing: Boolean(user.agreedToMarketing),
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({
      ok: true,
      users: users.map(serializeUser),
    });
  } catch (error) {
    console.error("Users GET error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "유저 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}
