import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/jwt";
import User from "@/models/User";

type SocialProvider = "google" | "kakao" | "apple";

type SocialAuthBody = {
  provider: SocialProvider;
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
};

function isValidProvider(provider: unknown): provider is SocialProvider {
  return provider === "google" || provider === "kakao" || provider === "apple";
}

function normalizeEmail(email: unknown) {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = (await request.json()) as SocialAuthBody;

    if (!isValidProvider(body.provider)) {
      return NextResponse.json(
        {
          ok: false,
          message: "지원하지 않는 로그인 방식입니다.",
        },
        { status: 400 }
      );
    }

    const providerId = normalizeText(body.providerId);

    if (!providerId) {
      return NextResponse.json(
        {
          ok: false,
          message: "providerId가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const email = normalizeEmail(body.email);
    const name = normalizeText(body.name);
    const avatar = normalizeText(body.avatar);

    let user = await User.findOne({
      provider: body.provider,
      providerId,
    });

    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        provider: body.provider,
        providerId,
        email,
        emailVerified: Boolean(body.emailVerified),
        name,
        avatar,
        nickname: "",
        role: "user",
        status: "active",
        isProfileCompleted: false,
        agreedToTerms: false,
        agreedToPrivacy: false,
        agreedToMarketing: false,
        lastLoginAt: new Date(),
      });
    } else {
      user.email = email || user.email;
      user.emailVerified = Boolean(body.emailVerified || user.emailVerified);
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      user.lastLoginAt = new Date();

      await user.save();
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        {
          ok: false,
          message: "정지된 계정입니다. 고객센터로 문의해주세요.",
        },
        { status: 403 }
      );
    }

    if (user.status === "deleted") {
      return NextResponse.json(
        {
          ok: false,
          message: "탈퇴 처리된 계정입니다.",
        },
        { status: 403 }
      );
    }

    const token = signAuthToken({
      userId: String(user._id),
      role: user.role,
      provider: user.provider,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      token,
      isNewUser,
      needsOnboarding: !user.isProfileCompleted,
      user: {
        id: String(user._id),
        provider: user.provider,
        providerId: user.providerId,
        email: user.email,
        emailVerified: user.emailVerified,
        nickname: user.nickname,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isProfileCompleted: user.isProfileCompleted,
        agreedToTerms: user.agreedToTerms,
        agreedToPrivacy: user.agreedToPrivacy,
        agreedToMarketing: user.agreedToMarketing,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Social auth error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "소셜 로그인 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
