import QRCode from 'qrcode';
import { FilterQuery } from 'mongoose';
import { User, IUser } from '../models/User';
import { ROLES } from '../constants/roles';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { generateQrToken, buildQrUrl, QR_CODE_OPTIONS } from '../utils/qrToken';
import {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from '../validators/user.validator';
import { PaginationMeta } from '../types';

export interface UserListResult {
  users: IUser[];
  meta: PaginationMeta;
}

export interface QrCodeResult {
  qrToken: string;
  qrUrl: string;
  qrDataUrl: string;
}

export class UserService {
  async create(input: CreateUserInput): Promise<{ user: IUser; tempPassword?: string }> {
    const role = input.role ?? ROLES.PARTICIPANT;

    if (role === ROLES.ADMIN) {
      if (!input.email) {
        throw new BadRequestError('Email is required for admin users', undefined, ERROR_CODES.EMAIL_REQUIRED_ADMIN);
      }
      if (!input.password) {
        throw new BadRequestError('Password is required for admin users', undefined, ERROR_CODES.PASSWORD_REQUIRED_ADMIN);
      }
    }

    if (role === ROLES.PARTICIPANT && !input.phone) {
      throw new BadRequestError('Phone is required for participants', undefined, ERROR_CODES.PHONE_REQUIRED_PARTICIPANT);
    }

    if (input.email) {
      const existingEmail = await User.findOne({
        email: input.email.toLowerCase(),
      });
      if (existingEmail) {
        throw new ConflictError('Email already in use', undefined, ERROR_CODES.EMAIL_ALREADY_IN_USE);
      }
    }

    if (input.phone) {
      const existingPhone = await User.findOne({ phone: input.phone });
      if (existingPhone) {
        throw new ConflictError('Phone number already in use', undefined, ERROR_CODES.PHONE_ALREADY_IN_USE);
      }
    }

    let tempPassword: string | undefined;

    const user = new User({
      name: input.name,
      email: input.email?.toLowerCase(),
      phone: input.phone,
      organization: input.organization,
      photoUrl: input.photoUrl || undefined,
      role,
      isActive: true,
    });

    if (role === ROLES.PARTICIPANT) {
      tempPassword = input.password ?? this.generateTempPassword();
      user.passwordHash = tempPassword;
    } else if (input.password) {
      user.passwordHash = input.password;
    }

    await user.save();

    return { user, tempPassword: role === ROLES.PARTICIPANT ? tempPassword : undefined };
  }

  async findAll(query: ListUsersQuery): Promise<UserListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const filter: FilterQuery<IUser> = {};

    if (query.role) {
      filter.role = query.role;
    } else {
      filter.role = ROLES.PARTICIPANT;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    } else {
      filter.isActive = true;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { organization: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<IUser> {
    const user = await this.findById(id);

    if (input.email && input.email !== user.email) {
      const existing = await User.findOne({ email: input.email.toLowerCase() });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Email already in use', undefined, ERROR_CODES.EMAIL_ALREADY_IN_USE);
      }
      user.email = input.email.toLowerCase();
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await User.findOne({ phone: input.phone });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Phone number already in use', undefined, ERROR_CODES.PHONE_ALREADY_IN_USE);
      }
      user.phone = input.phone;
    }

    if (input.name) user.name = input.name;
    if (input.organization !== undefined) user.organization = input.organization;
    if (input.photoUrl !== undefined) {
      user.photoUrl = input.photoUrl || undefined;
    }
    if (input.isActive !== undefined) user.isActive = input.isActive;
    if (input.password) user.passwordHash = input.password;

    await user.save();
    return user;
  }

  async softDelete(id: string): Promise<IUser> {
    const user = await this.findById(id);
    user.isActive = false;
    await user.save();
    return user;
  }

  async getQrCode(userId: string): Promise<QrCodeResult> {
    const user = await this.findById(userId);

    if (!user.qrToken) {
      throw new BadRequestError('User does not have a QR token', undefined, ERROR_CODES.NO_QR_TOKEN);
    }

    const qrUrl = buildQrUrl(user.qrToken);
    const qrDataUrl = await QRCode.toDataURL(user.qrToken, QR_CODE_OPTIONS);

    return {
      qrToken: user.qrToken,
      qrUrl,
      qrDataUrl,
    };
  }

  async regenerateQrToken(userId: string): Promise<QrCodeResult> {
    const user = await this.findById(userId);

    if (user.role !== ROLES.PARTICIPANT) {
      throw new BadRequestError('Only participants can have QR tokens', undefined, ERROR_CODES.PARTICIPANTS_ONLY_QR);
    }

    user.qrToken = generateQrToken();
    await user.save();

    return this.getQrCode(userId);
  }

  private generateTempPassword(): string {
    return generateQrToken().slice(0, 10);
  }
}

export const userService = new UserService();
