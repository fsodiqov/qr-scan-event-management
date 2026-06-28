import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { generateQrToken } from '../utils/qrToken';

export interface IParticipant extends Document {
  organizationId: Types.ObjectId;
  eventId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  qrToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipantModel extends Model<IParticipant> {
  findByQrToken(token: string): Promise<IParticipant | null>;
}

const participantSchema = new Schema<IParticipant, IParticipantModel>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    photoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    qrToken: {
      type: String,
      unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

participantSchema.index({ organizationId: 1, eventId: 1 });
participantSchema.index({ eventId: 1, phone: 1 });
participantSchema.index({ eventId: 1, isActive: 1 });
participantSchema.index({ name: 'text', phone: 'text' });

participantSchema.pre('save', function (next) {
  if (this.isNew && !this.qrToken) {
    this.qrToken = generateQrToken();
  }
  next();
});

participantSchema.statics.findByQrToken = function (token: string) {
  return this.findOne({ qrToken: token, isActive: true });
};

export const Participant = mongoose.model<IParticipant, IParticipantModel>(
  'Participant',
  participantSchema,
);
