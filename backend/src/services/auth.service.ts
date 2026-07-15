import { User, IUser } from '../models/User';
import { OrganizationUser } from '../models/OrganizationUser';
import { Organization } from '../models/Organization';
import { PLATFORM_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { signToken } from '../utils/jwt';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
} from '../utils/AppError';
import { LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import { env } from '../config/env';
import {
  processLogoFromDataUriOrUrl,
  processLogoToDataUri,
} from '../utils/processLogo';

export interface AuthUserInfo {
  id: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
}

export interface AuthOrganizationInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUserInfo;
  organization?: AuthOrganizationInfo;
  role: string;
}

export class AuthService {
  async login(input: LoginInput): Promise<AuthResult> {
    const { login, password, rememberMe } = input;
    const expiresIn = rememberMe ? env.JWT_REMEMBER_EXPIRES_IN : env.JWT_EXPIRES_IN;

    const user = await User.findOne({ login: login.trim() }).select('+passwordHash');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.isSuperAdmin) {
      const token = signToken(
        {
          sub: user._id.toString(),
          role: PLATFORM_ROLES.SUPER_ADMIN,
          login: user.login,
          phone: user.phone,
        },
        expiresIn,
      );

      return {
        token,
        user: this.formatUser(user),
        role: PLATFORM_ROLES.SUPER_ADMIN,
      };
    }

    const orgUser = await OrganizationUser.findOne({
      userId: user._id,
      status: ORG_USER_STATUS.ACTIVE,
    });

    if (!orgUser) {
      throw new ForbiddenError(
        'Organization membership is required',
        ERROR_CODES.ORG_MEMBERSHIP_REQUIRED,
      );
    }

    const organization = await Organization.findById(orgUser.organizationId);

    if (!organization) {
      throw new ForbiddenError('Organization not found', ERROR_CODES.ORGANIZATION_NOT_FOUND);
    }

    const token = signToken(
      {
        sub: user._id.toString(),
        organizationId: organization._id.toString(),
        role: orgUser.role,
        login: user.login,
        phone: user.phone,
      },
      expiresIn,
    );

    return {
      token,
      user: this.formatUser(user),
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
      },
      role: orgUser.role,
    };
  }

  async getProfile(userId: string): Promise<{
    user: AuthUserInfo;
    organization?: AuthOrganizationInfo;
    role?: string;
  }> {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    if (user.isSuperAdmin) {
      return {
        user: this.formatUser(user),
        role: PLATFORM_ROLES.SUPER_ADMIN,
      };
    }

    const orgUser = await OrganizationUser.findOne({
      userId: user._id,
      status: ORG_USER_STATUS.ACTIVE,
    });

    if (!orgUser) {
      throw new ForbiddenError(
        'Organization membership is required',
        ERROR_CODES.ORG_MEMBERSHIP_REQUIRED,
      );
    }

    const organization = await Organization.findById(orgUser.organizationId);

    if (!organization) {
      throw new ForbiddenError('Organization not found', ERROR_CODES.ORGANIZATION_NOT_FOUND);
    }

    return {
      user: this.formatUser(user),
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
      },
      role: orgUser.role,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUserInfo> {
    const user = await User.findById(userId).select('+passwordHash');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    const requiresCurrentPassword = input.login !== undefined || Boolean(input.newPassword);

    if (requiresCurrentPassword) {
      if (!input.currentPassword) {
        throw new BadRequestError(
          'Current password is required',
          undefined,
          ERROR_CODES.PASSWORD_REQUIRED,
        );
      }

      const isValid = await user.comparePassword(input.currentPassword);
      if (!isValid) {
        throw new UnauthorizedError(
          'Current password is incorrect',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }
    }

    if (input.login !== undefined) {
      const normalizedLogin = input.login.trim();
      if (normalizedLogin !== user.login) {
        const existing = await User.findOne({
          login: normalizedLogin,
          _id: { $ne: user._id },
        });
        if (existing) {
          throw new ConflictError('Login already in use', undefined, ERROR_CODES.LOGIN_ALREADY_IN_USE);
        }
        user.login = normalizedLogin;
      }
    }

    if (input.name) {
      user.name = input.name;
    }

    if (input.newPassword) {
      user.passwordHash = input.newPassword;
    }

    if (input.photoUrl !== undefined) {
      user.photoUrl = input.photoUrl
        ? await processLogoFromDataUriOrUrl(input.photoUrl)
        : undefined;
    }

    await user.save();
    return this.formatUser(user);
  }

  async uploadMyPhoto(userId: string, file?: Express.Multer.File): Promise<AuthUserInfo> {
    if (!file?.buffer?.length) {
      throw new BadRequestError('Photo file is required');
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    user.photoUrl = await processLogoToDataUri(file.buffer);
    await user.save();
    return this.formatUser(user);
  }

  async createSuperAdmin(data: {
    name: string;
    login: string;
    password: string;
  }): Promise<IUser> {
    const normalizedLogin = data.login.trim();
    const existing = await User.findOne({ login: normalizedLogin });

    if (existing) {
      throw new BadRequestError('User with this login already exists', undefined, ERROR_CODES.ADMIN_LOGIN_EXISTS);
    }

    const user = new User({
      name: data.name,
      login: normalizedLogin,
      passwordHash: data.password,
      isSuperAdmin: true,
      isActive: true,
    });

    await user.save();
    return user;
  }

  private formatUser(user: IUser): AuthUserInfo {
    return {
      id: user._id.toString(),
      name: user.name,
      login: user.login,
      phone: user.phone,
      photoUrl: user.photoUrl,
    };
  }
}

export const authService = new AuthService();
