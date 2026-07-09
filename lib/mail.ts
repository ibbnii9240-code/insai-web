import nodemailer from "nodemailer";

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || `insai <${MAIL_USER}>`;

if (!MAIL_USER) {
  throw new Error("MAIL_USER is not defined in .env.local");
}

if (!MAIL_PASS) {
  throw new Error("MAIL_PASS is not defined in .env.local");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

type SendContactReplyMailParams = {
  to: string;
  name: string;
  category: string;
  message: string;
  adminReply: string;
};

export async function sendContactReplyMail({
  to,
  name,
  category,
  message,
  adminReply,
}: SendContactReplyMailParams) {
  const safeName = name || "고객";
  const subject = `[insai] 문의 답변이 도착했습니다.`;

  const text = `
안녕하세요, ${safeName}님.
insai 고객센터입니다.

남겨주신 문의에 답변드립니다.

[문의 유형]
${category}

[문의 내용]
${message}

[관리자 답변]
${adminReply}

감사합니다.
insai 고객센터
`.trim();

  const html = `
    <div style="margin:0;padding:0;background:#f8fbff;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        <div style="background:white;border-radius:28px;padding:32px;box-shadow:0 16px 40px rgba(14,165,233,0.12);">
          <h1 style="margin:0;font-size:28px;font-weight:900;color:#0f172a;">insai 문의 답변</h1>
          <p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:#475569;">
            안녕하세요, <b>${safeName}</b>님.<br />
            남겨주신 문의에 답변드립니다.
          </p>

          <div style="margin-top:28px;padding:20px;border-radius:20px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#8b5cf6;">문의 유형</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${category}</p>
          </div>

          <div style="margin-top:16px;padding:20px;border-radius:20px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#64748b;">문의 내용</p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#334155;white-space:pre-line;">${message}</p>
          </div>

          <div style="margin-top:16px;padding:20px;border-radius:20px;background:#ecfdf5;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#10b981;">관리자 답변</p>
            <p style="margin:0;font-size:16px;line-height:1.8;color:#064e3b;white-space:pre-line;">${adminReply}</p>
          </div>

          <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#64748b;">
            감사합니다.<br />
            insai 고객센터
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}
