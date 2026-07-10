import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { sendContactReplyMail } from "@/lib/mail";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateContactBody = {
  status?: "대기" | "확인중" | "완료";
  adminReply?: string;
};

const allowedStatuses = ["대기", "확인중", "완료"];

function normalizeSource(value: unknown) {
  const source = String(value || "").trim().toLowerCase();

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

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const contact = await Contact.findById(id).lean();

    if (!contact) {
      return NextResponse.json(
        {
          ok: false,
          message: "문의를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      contact: serializeContact(contact),
    });
  } catch (error) {
    console.error("Contact GET error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "문의 상세 정보를 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = (await request.json()) as UpdateContactBody;

    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        {
          ok: false,
          message: "문의를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    let shouldSendReplyEmail = false;

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

      contact.status = body.status;
    }

    if (typeof body.adminReply === "string") {
      const trimmedReply = body.adminReply.trim();

      contact.adminReply = trimmedReply;

      if (trimmedReply.length > 0) {
        contact.status = "완료";
        contact.repliedAt = new Date();
        shouldSendReplyEmail = true;
      } else {
        contact.repliedAt = null;
        contact.emailSentAt = null;
      }
    }

    if (!body.status && typeof body.adminReply !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "변경할 내용이 없습니다.",
        },
        { status: 400 }
      );
    }

    let emailSent = false;
    let emailError = "";

    if (shouldSendReplyEmail) {
      try {
        await sendContactReplyMail({
          to: contact.email,
          name: contact.name,
          category: contact.category,
          message: contact.message,
          adminReply: contact.adminReply || "",
        });

        contact.emailSentAt = new Date();
        emailSent = true;
      } catch (error) {
        emailError = "답변은 저장됐지만 이메일 발송에는 실패했습니다.";
        console.error("Contact reply email failed:", error);
      }
    }

    await contact.save();

    return NextResponse.json({
      ok: true,
      message: emailError || "문의가 수정되었습니다.",
      emailSent,
      emailError,
      contact: serializeContact(contact),
    });
  } catch (error) {
    console.error("Contact PATCH error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "문의 상태 변경 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        {
          ok: false,
          message: "문의를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "문의가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Contact DELETE error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "문의 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}