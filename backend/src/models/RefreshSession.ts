import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshSession extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  rememberMe: boolean;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshSessionSchema = new Schema<IRefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    userAgent: {
      type: String,
      maxlength: 512,
      trim: true,
    },
    ip: {
      type: String,
      maxlength: 64,
      trim: true,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshSessionSchema.index({ userId: 1, revokedAt: 1 });

export const RefreshSession = mongoose.model<IRefreshSession>(
  'RefreshSession',
  refreshSessionSchema,
);
