import mongoose, { Schema, models, model } from "mongoose";

export type AuthProvider = "google" | "kakao" | "apple";
export type UserRole = "user" | "staff" | "owner";
export type UserStatus = "active" | "suspended" | "deleted";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;

  provider: AuthProvider;
  providerId: string;

  email?: string;
  emailVerified?: boolean;

  nickname?: string;
  name?: string;
  avatar?: string;

  birthDate?: Date | null;
  gender?: "male" | "female" | "other" | "";
  country?: string;
  language?: string;

  role: UserRole;
  status: UserStatus;

  isProfileCompleted: boolean;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing: boolean;

  lastLoginAt?: Date | null;
  suspendedAt?: Date | null;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    provider: {
      type: String,
      enum: ["google", "kakao", "apple"],
      required: true,
      index: true,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    nickname: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    birthDate: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      trim: true,
      default: "ko",
    },

    role: {
      type: String,
      enum: ["user", "staff", "owner"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
      index: true,
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    agreedToTerms: {
      type: Boolean,
      default: false,
    },
    agreedToPrivacy: {
      type: Boolean,
      default: false,
    },
    agreedToMarketing: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index(
  {
    provider: 1,
    providerId: 1,
  },
  {
    unique: true,
  }
);

UserSchema.index(
  {
    email: 1,
    provider: 1,
  }
);

const User = models.User || model<UserDocument>("User", UserSchema);

export default User;
