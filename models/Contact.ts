import mongoose, { Schema, models, model } from "mongoose";

export type ContactStatus = "대기" | "확인중" | "완료";

export type ContactDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  category: string;
  message: string;
  status: ContactStatus;
  adminReply?: string;
  repliedAt?: Date | null;
  emailSentAt?: Date | null;
  userId?: string;
  source?: string;
  appVersion?: string;
  createdAt: Date;
  updatedAt: Date;
};

const ContactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true, trim: true, default: "이름 없음" },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "이메일 없음",
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "일반 문의",
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["대기", "확인중", "완료"],
      default: "대기",
    },
    adminReply: { type: String, trim: true, default: "" },
    repliedAt: { type: Date, default: null },
    emailSentAt: { type: Date, default: null },

    // 앱에서 들어온 문의 구분용
    userId: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "WEB" },
    appVersion: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Contact =
  models.Contact || model<ContactDocument>("Contact", ContactSchema);

export default Contact;
