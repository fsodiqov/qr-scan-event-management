import { User, IUser } from '../models/User';
import { ROLES } from '../constants/roles';
import { signToken } from '../utils/jwt';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  UnauthorizedError,
} from '../utils/AppError';
import { LoginInput } from '../validators/auth.validator';

export interface AuthResult {
  token: string;
  user: IUser;
}

export class AuthService {
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, phone, password } = input;

    let user: IUser | null = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select(
        '+passwordHash',
      );
    } else if (phone) {
      user = await User.findOne({ phone }).select('+passwordHash');
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      phone: user.phone,
    });

    return { token, user };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    return user;
  }

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });

    if (existing) {
      throw new BadRequestError('Admin with this email already exists', undefined, ERROR_CODES.ADMIN_EMAIL_EXISTS);
    }

    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password,
      role: ROLES.ADMIN,
      isActive: true,
    });

    await user.save();
    return user;
  }
}

export const authService = new AuthService();
