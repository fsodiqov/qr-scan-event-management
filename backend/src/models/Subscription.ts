import mongoose, { Document, Schema } from 'mongoose';
import {
  SUBSCRIPTION_PLAN_CODE,
  SUBSCRIPTION_STATUS,
  SubscriptionPlanCode,
  SubscriptionStatus,
} from '../constants/subscriptionStatus';

export interface ISubscription extends Document {
  name: string;
  planCode: SubscriptionPlanCode;
  status: SubscriptionStatus;
  limits?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: 120,
    },
    planCode: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLAN_CODE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    limits: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const { __v: _v, ...safe } = ret;
        return safe;
      },
    },
  },
);

subscriptionSchema.index({ planCode: 1 });
subscriptionSchema.index({ status: 1 });

export const Subscription = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema,
);
