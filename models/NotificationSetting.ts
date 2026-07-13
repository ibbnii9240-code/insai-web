import mongoose, { Schema, model, models } from "mongoose";

export type NotificationSettingsValue = {
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

export type NotificationSettingDocument = {
  _id: mongoose.Types.ObjectId;
  webUserId: string;
  appUserId?: string;
  settings: NotificationSettingsValue;
  createdAt: Date;
  updatedAt: Date;
};

const NotificationSettingsSchema =
  new Schema<NotificationSettingsValue>(
    {
      allNotifications: {
        type: Boolean,
        default: true,
      },

      communityEnabled: {
        type: Boolean,
        default: true,
      },
      follow: {
        type: Boolean,
        default: true,
      },
      postLike: {
        type: Boolean,
        default: true,
      },
      comment: {
        type: Boolean,
        default: true,
      },
      communityMessage: {
        type: Boolean,
        default: true,
      },
      friendRequest: {
        type: Boolean,
        default: true,
      },

      datingEnabled: {
        type: Boolean,
        default: true,
      },
      match: {
        type: Boolean,
        default: true,
      },
      datingMessage: {
        type: Boolean,
        default: true,
      },
      datingLike: {
        type: Boolean,
        default: true,
      },

      supportEnabled: {
        type: Boolean,
        default: true,
      },
      inquiryReply: {
        type: Boolean,
        default: true,
      },
      reportResult: {
        type: Boolean,
        default: true,
      },

      marketing: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );

const NotificationSettingSchema =
  new Schema<NotificationSettingDocument>(
    {
      webUserId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
      },

      appUserId: {
        type: String,
        trim: true,
        default: "",
        index: true,
      },

      settings: {
        type: NotificationSettingsSchema,
        required: true,
        default: () => ({}),
      },
    },
    {
      timestamps: true,
    }
  );

NotificationSettingSchema.index({
  appUserId: 1,
  updatedAt: -1,
});

const NotificationSetting =
  models.NotificationSetting ||
  model<NotificationSettingDocument>(
    "NotificationSetting",
    NotificationSettingSchema
  );

export default NotificationSetting;