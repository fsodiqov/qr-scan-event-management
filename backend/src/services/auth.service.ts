import crypto from 'crypto';
import { Request, Response } from 'express';
import { User, IUser, MAX_FAILED_LOGIN_ATTEMPTS, LOGIN_LOCK_DURATION_MS } from '../models/User';
import { RefreshSession, IRefreshSession } from '../models/RefreshSession';
import { OrganizationUser } from '../models/OrganizationUser';
import { Organization } from '../models/Organization';
import { PLATFORM_ROLES, Role } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { signAccessToken } from '../utils/jwt';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/AppError';
import { LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import {
  processLogoFromDataUriOrUrl,
  processLogoToDataUri,
} from '../utils/processLogo';
import {
  clearRefreshCookie,
  getRefreshTokenFromRequest,
  refreshTtlMs,
  setRefreshCookie,
} from '../utils/refreshCookie';
import { JwtPayload } from '../types';

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
  accessToken: string;
  user: AuthUserInfo;
  organization?: AuthOrganizationInfo;
  role: Role;
}

export interface SessionInfo {
  id: string;
  userAgent?: string;
  ip?: string;
  rememberMe: boolean;
  createdAt: Date;
  expiresAt: Date;
  current: boolean;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export class AuthService {
  async login(
    input: LoginInput,
    req: Request,
    res: Response,
  ): Promise<AuthResult> {
    const { login, password, rememberMe } = input;

    const user = await User.findOne({ login: login.trim() }).select(
      '+passwordHash +failedLoginAttempts +lockUntil',
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.isLocked()) {
      throw new UnauthorizedError(
        'Account temporarily locked. Try again later.',
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      await this.registerFailedLogin(user);
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const authPayload = await this.buildAuthPayload(user);
    const accessToken = signAccessToken(authPayload.jwt);

    await this.issueRefreshSession({
      userId: user._id.toString(),
      rememberMe: Boolean(rememberMe),
      req,
      res,
    });

    return {
      accessToken,
      user: authPayload.user,
      organization: authPayload.organization,
      role: authPayload.role,
    };
  }

  async refresh(req: Request, res: Response): Promise<{ accessToken: string }> {
    const rawToken = getRefreshTokenFromRequest(req);
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token is required', ERROR_CODES.REFRESH_TOKEN_REQUIRED);
    }

    const tokenHash = hashToken(rawToken);
    const session = await RefreshSession.findOne({ tokenHash });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      clearRefreshCookie(res);
      throw new UnauthorizedError(
        'Invalid or expired refresh token',
        ERROR_CODES.INVALID_OR_EXPIRED_REFRESH_TOKEN,
      );
    }

    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      session.revokedAt = new Date();
      await session.save();
      clearRefreshCookie(res);
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    // Rotate: revoke old session, issue new one
    session.revokedAt = new Date();
    await session.save();

    const authPayload = await this.buildAuthPayload(user);
    const accessToken = signAccessToken(authPayload.jwt);

    await this.issueRefreshSession({
      userId: user._id.toString(),
      rememberMe: session.rememberMe,
      req,
      res,
    });

    return { accessToken };
  }

  async logout(req: Request, res: Response): Promise<void> {
    const rawToken = getRefreshTokenFromRequest(req);
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshSession.updateOne(
        { tokenHash, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      );
    }
    clearRefreshCookie(res);
  }

  async logoutAll(userId: string, res: Response): Promise<void> {
    await RefreshSession.updateMany(
      { userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
    clearRefreshCookie(res);
  }

  async listSessions(userId: string, req: Request): Promise<SessionInfo[]> {
    const currentHash = (() => {
      const raw = getRefreshTokenFromRequest(req);
      return raw ? hashToken(raw) : null;
    })();

    const sessions = await RefreshSession.find({
      userId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return sessions.map((session) => ({
      id: session._id.toString(),
      userAgent: session.userAgent,
      ip: session.ip,
      rememberMe: session.rememberMe,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      current: currentHash !== null && session.tokenHash === currentHash,
    }));
  }

  async revokeSession(userId: string, sessionId: string, req: Request, res: Response): Promise<void> {
    const session = await RefreshSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new NotFoundError('Session not found', ERROR_CODES.SESSION_NOT_FOUND);
    }

    if (!session.revokedAt) {
      session.revokedAt = new Date();
      await session.save();
    }

    const raw = getRefreshTokenFromRequest(req);
    if (raw && hashToken(raw) === session.tokenHash) {
      clearRefreshCookie(res);
    }
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

  private async registerFailedLogin(user: IUser): Promise<void> {
    user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOGIN_LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
  }

  private async issueRefreshSession(params: {
    userId: string;
    rememberMe: boolean;
    req: Request;
    res: Response;
  }): Promise<IRefreshSession> {
    const rawToken = createRefreshTokenValue();
    const expiresAt = new Date(Date.now() + refreshTtlMs(params.rememberMe));

    const session = await RefreshSession.create({
      userId: params.userId,
      tokenHash: hashToken(rawToken),
      userAgent: params.req.get('user-agent')?.slice(0, 512),
      ip: params.req.ip || params.req.socket.remoteAddress,
      rememberMe: params.rememberMe,
      expiresAt,
    });

    setRefreshCookie(params.res, rawToken, {
      rememberMe: params.rememberMe,
      expiresAt,
    });

    return session;
  }

  private async buildAuthPayload(user: IUser): Promise<{
    jwt: JwtPayload;
    user: AuthUserInfo;
    organization?: AuthOrganizationInfo;
    role: Role;
  }> {
    if (user.isSuperAdmin) {
      return {
        jwt: {
          sub: user._id.toString(),
          role: PLATFORM_ROLES.SUPER_ADMIN,
          login: user.login,
          phone: user.phone,
        },
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
      jwt: {
        sub: user._id.toString(),
        organizationId: organization._id.toString(),
        role: orgUser.role,
        login: user.login,
        phone: user.phone,
      },
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
