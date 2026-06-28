import mongoose, { Document, Schema, Types } from 'mongoose';
import { ORG_ROLES, OrgRole } from '../constants/roles';
import {
  ORG_USER_STATUS,
  OrgUserStatus,
} from '../constants/organizationUserStatus';

export interface IOrganizationUser extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrgRole;
  status: OrgUserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const organizationUserSchema = new Schema<IOrganizationUser>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ORG_ROLES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORG_USER_STATUS),
      default: ORG_USER_STATUS.ACTIVE,
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

organizationUserSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
organizationUserSchema.index({ userId: 1 }, { unique: true });
organizationUserSchema.index({ organizationId: 1, role: 1 });
organizationUserSchema.index({ organizationId: 1, status: 1 });

export const OrganizationUser = mongoose.model<IOrganizationUser>(
  'OrganizationUser',
  organizationUserSchema,
);
