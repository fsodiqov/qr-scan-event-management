import mongoose, { Document, Schema, Types } from 'mongoose';
import { SCAN_RESULT, ScanResult } from '../constants/attendanceStatus';

export interface IScanLog extends Document {
  userId?: Types.ObjectId;
  eventId: Types.ObjectId;
  scannedBy: Types.ObjectId;
  result: ScanResult;
  scannedAt: Date;
  metadata?: Record<string, unknown>;
}

const scanLogSchema = new Schema<IScanLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
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
scanLogSchema.index({ userId: 1, scannedAt: -1 });
scanLogSchema.index({ scannedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const ScanLog = mongoose.model<IScanLog>('ScanLog', scanLogSchema);
