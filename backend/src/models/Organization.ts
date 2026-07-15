import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  ORGANIZATION_STATUS,
  OrganizationStatus,
} from '../constants/organizationStatus';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  logo?: string;
  subscriptionId?: Types.ObjectId;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    logo: {
      type: String,
      trim: true,
      maxlength: 200000,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    status: {
      type: String,
      enum: Object.values(ORGANIZATION_STATUS),
      default: ORGANIZATION_STATUS.ACTIVE,
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

organizationSchema.index({ status: 1 });
organizationSchema.index({ subscriptionId: 1 });

export const Organization = mongoose.model<IOrganization>(
  'Organization',
  organizationSchema,
);
