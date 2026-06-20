import mongoose, { Document, Schema, Types } from 'mongoose';
import { EVENT_STATUS, EventStatus } from '../constants/eventStatus';

export interface IEvent extends Document {
  title: string;
  description?: string;
  location: string;
  eventDate: Date;
  status: EventStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 300,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

eventSchema.index({ eventDate: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
