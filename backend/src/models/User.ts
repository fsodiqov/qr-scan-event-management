import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export interface IUser extends Document {
  name: string;
  login?: string;
  phone?: string;
  passwordHash?: string;
  photoUrl?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    login: {
      type: String,
      trim: true,
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
    photoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
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

userSchema.index({ isActive: 1 });
userSchema.index({ name: 'text', phone: 'text', login: 'text' });

userSchema.pre('save', async function (next) {
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

export const User = mongoose.model<IUser>('User', userSchema);
