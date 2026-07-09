import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/jwt";
import User from "@/models/User";

type OnboardingBody = {
  nickname?: string;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "";
  country?: string;
  language?: string;
  agreedToTerms?: boolean;
  agreedToPrivacy?: boolean;
  agreedToMarketing?: boolean;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidGender(gender: unknown) {
  return (
    gender === "male" ||
    gender === "female" ||
    gender === "other" ||
    gender === ""
  );
}

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as OnboardingBody;

    const nickname = normalizeText(body.nickname);
    const country = normalizeText(body.country);
    const language = normalizeText(body.language) || "ko";
    const gender = isValidGender(body.gender) ? body.gender : "";

    if (nickname.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          message: "닉네임은 2글자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!body.agreedToTerms || !body.agreedToPrivacy) {
      return NextResponse.json(
        {
          ok: false,
          message: "필수 약관에 동의해주세요.",
        },
        { status: 400 }
      );
    }

    const existingNicknameUser = await User.findOne({
      nickname,
      _id: {
        $ne: authUser.userId,
      },
      status: {
        $ne: "deleted",
      },
    });

    if (existingNicknameUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "이미 사용 중인 닉네임입니다.",
        },
        { status: 409 }
      );
    }

    let parsedBirthDate: Date | null = null;

    if (body.birthDate) {
      const date = new Date(body.birthDate);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          {
            ok: false,
            message: "생년월일 형식이 올바르지 않습니다.",
          },
          { status: 400 }
        );
      }

      parsedBirthDate = date;
    }

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        nickname,
        birthDate: parsedBirthDate,
        gender,
        country,
        language,
        agreedToTerms: Boolean(body.agreedToTerms),
        agreedToPrivacy: Boolean(body.agreedToPrivacy),
        agreedToMarketing: Boolean(body.agreedToMarketing),
        isProfileCompleted: true,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
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
    console.error("Onboarding error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "온보딩 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
