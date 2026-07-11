import mongoose, { Schema, models, model } from "mongoose";

export type ReportStatus = "대기" | "확인중" | "완료" | "반려";

export type ReportDocument = {
  _id: mongoose.Types.ObjectId;

  appReportId?: string;

  reporterName?: string;
  reporterEmail?: string;
  reporterId?: string;

  reportedUserId?: string;
  reportedNickname?: string;

  category: string;
  reason: string;
  message?: string;

  postId?: string;
  chatRoomId?: string;
  messageId?: string;

  status: ReportStatus;
  adminNote?: string;
  processedAt?: Date | null;

  userId?: string;
  appUserId?: string;
  webUserId?: string;

  source?: string;
  appVersion?: string;

  createdAt: Date;
  updatedAt: Date;
};

const ReportSchema = new Schema<ReportDocument>(
  {
    appReportId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    reporterName: {
      type: String,
      trim: true,
      default: "insai 사용자",
    },
    reporterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "이메일 없음",
      index: true,
    },
    reporterId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    reportedUserId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    reportedNickname: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "신고",
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },

    postId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    chatRoomId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    messageId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    status: {
      type: String,
      enum: ["대기", "확인중", "완료", "반려"],
      default: "대기",
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    processedAt: {
      type: Date,
      default: null,
    },

    userId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    appUserId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    webUserId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    source: {
      type: String,
      trim: true,
      lowercase: true,
      default: "app",
      index: true,
    },
    appVersion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ appReportId: 1, createdAt: -1 });
ReportSchema.index({ appUserId: 1, createdAt: -1 });
ReportSchema.index({ webUserId: 1, createdAt: -1 });
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ reporterId: 1, createdAt: -1 });
ReportSchema.index({ reporterEmail: 1, createdAt: -1 });
ReportSchema.index({ postId: 1, createdAt: -1 });
ReportSchema.index({ chatRoomId: 1, createdAt: -1 });
ReportSchema.index({ messageId: 1, createdAt: -1 });

const Report =
  models.Report || model<ReportDocument>("Report", ReportSchema);

export default Report;
