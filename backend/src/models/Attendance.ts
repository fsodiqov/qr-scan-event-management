import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
} from '../constants/attendanceStatus';

export interface IAttendance extends Document {
  participantId: Types.ObjectId;
  eventId: Types.ObjectId;
  organizationId: Types.ObjectId;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
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
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true,
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

attendanceSchema.index({ participantId: 1, eventId: 1 }, { unique: true });
attendanceSchema.index({ eventId: 1, status: 1 });
attendanceSchema.index({ participantId: 1, createdAt: -1 });
attendanceSchema.index({ organizationId: 1 });
attendanceSchema.index({ organizationId: 1, eventId: 1 });

attendanceSchema.pre('save', function (next) {
  if (
    this.checkInTime &&
    this.checkOutTime &&
    this.checkOutTime <= this.checkInTime
  ) {
    return next(new Error('Check-out time must be after check-in time'));
  }
  next();
});

export const Attendance = mongoose.model<IAttendance>(
  'Attendance',
  attendanceSchema,
);
