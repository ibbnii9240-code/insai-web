import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/jwt";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await connectDB();

    const authUser = getAuthUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId).lean();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        {
          ok: false,
          message: "정지된 계정입니다.",
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

    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        provider: user.provider,
        providerId: user.providerId,
        email: user.email,
        emailVerified: user.emailVerified,
        nickname: user.nickname,
        name: user.name,
        avatar: user.avatar,
        birthDate: user.birthDate,
        gender: user.gender,
        country: user.country,
        language: user.language,
        role: user.role,
        status: user.status,
        isProfileCompleted: user.isProfileCompleted,
        agreedToTerms: user.agreedToTerms,
        agreedToPrivacy: user.agreedToPrivacy,
        agreedToMarketing: user.agreedToMarketing,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "내 정보 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
