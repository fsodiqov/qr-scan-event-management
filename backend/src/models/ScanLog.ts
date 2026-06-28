import mongoose, { Document, Schema, Types } from 'mongoose';
import { SCAN_RESULT, ScanResult } from '../constants/attendanceStatus';

export interface IScanLog extends Document {
  participantId?: Types.ObjectId;
  eventId: Types.ObjectId;
  organizationId: Types.ObjectId;
  scannedBy: Types.ObjectId;
  result: ScanResult;
  scannedAt: Date;
  metadata?: Record<string, unknown>;
}

const scanLogSchema = new Schema<IScanLog>(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    result: {
      type: String,
      enum: Object.values(SCAN_RESULT),
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        const { __v: _v, ...safe } = ret;
        return safe;
      },
    },
  },
);

scanLogSchema.index({ eventId: 1, scannedAt: -1 });
scanLogSchema.index({ participantId: 1, scannedAt: -1 });
scanLogSchema.index({ organizationId: 1, scannedAt: -1 });
scanLogSchema.index({ scannedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const ScanLog = mongoose.model<IScanLog>('ScanLog', scanLogSchema);
