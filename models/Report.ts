import { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    reporterId: { type: String, required: true },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String, default: "" },

    targetUserId: { type: String, required: true },
    targetUserName: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "스팸",
        "사칭",
        "욕설",
        "성희롱",
        "부적절한 콘텐츠",
        "기타",
      ],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["대기", "확인중", "완료", "기각"],
      default: "대기",
    },

    adminMemo: {
      type: String,
      default: "",
    },

    processedBy: {
      type: String,
      default: "",
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Report = models.Report || model("Report", ReportSchema);

export default Report;
