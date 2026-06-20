import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '../constants/roles';
import { generateQrToken } from '../utils/qrToken';

const BCRYPT_ROUNDS = 12;

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  organization?: string;
  photoUrl?: string;
  role: Role;
  qrToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  findByQrToken(token: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
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
      sparse: true,
      unique: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: 20,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    organization: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    photoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
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
        const { passwordHash: _passwordHash, __v: _v, ...safe } = ret;
        return safe;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ name: 'text', phone: 'text', organization: 'text' });

userSchema.pre('save', async function (next) {
  if (this.isNew && this.role === ROLES.PARTICIPANT && !this.qrToken) {
    this.qrToken = generateQrToken();
  }

  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }

  if (!this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_ROUNDS);
  }

  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.findByQrToken = function (token: string) {
  return this.findOne({ qrToken: token, isActive: true });
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
