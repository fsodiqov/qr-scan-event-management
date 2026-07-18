import { FilterQuery, Types } from 'mongoose';
import { User, IUser } from '../models/User';
import { OrganizationUser, IOrganizationUser } from '../models/OrganizationUser';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from '../validators/user.validator';
import { PaginationMeta, AuthContext } from '../types';
import { requireOrganizationId } from '../utils/tenantScope';
import { generateCompliantPassword } from '../utils/generatePassword';

export interface StaffListItem {
  id: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserListResult {
  users: StaffListItem[];
  meta: PaginationMeta;
}

export class UserService {
  async create(
    auth: AuthContext,
    input: CreateUserInput,
  ): Promise<{ user: StaffListItem; tempPassword?: string }> {
    const organizationId = requireOrganizationId(auth);

    const existingLogin = await User.findOne({ login: input.login.trim() });
    if (existingLogin) {
      const existingMembership = await OrganizationUser.findOne({
        userId: existingLogin._id,
      });
      if (existingMembership) {
        throw new ConflictError('User already belongs to an organization', undefined, ERROR_CODES.USER_ALREADY_IN_ORG);
      }
    }

    const tempPassword = input.password ?? generateCompliantPassword();

    const user = new User({
      name: input.name,
      login: input.login.trim(),
      phone: input.phone,
      photoUrl: input.photoUrl || undefined,
      passwordHash: tempPassword,
      isActive: true,
      isSuperAdmin: false,
    });

    await user.save();

    await OrganizationUser.create({
      organizationId: new Types.ObjectId(organizationId),
      userId: user._id,
      role: input.role,
      status: ORG_USER_STATUS.ACTIVE,
    });

    return {
      user: this.formatStaff(user, input.role),
      tempPassword: input.password ? undefined : tempPassword,
    };
  }

  async findAll(auth: AuthContext, query: ListUsersQuery): Promise<UserListResult> {
    const organizationId = requireOrganizationId(auth);
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const filter: FilterQuery<IOrganizationUser> = {
      organizationId: new Types.ObjectId(organizationId),
      role: { $ne: ORG_ROLES.OWNER },
    };

    if (query.role) filter.role = query.role;

    const orgUsers = await OrganizationUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const userIds = orgUsers.map((ou) => ou.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    let staffList = orgUsers
      .map((ou) => {
        const user = userMap.get(ou.userId.toString());
        if (!user) return null;
        return this.formatStaff(user, ou.role, ou);
      })
      .filter((item): item is StaffListItem => item !== null);

    if (query.isActive !== undefined) {
      staffList = staffList.filter((s) => s.isActive === query.isActive);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      staffList = staffList.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.login?.toLowerCase().includes(search) ||
          s.phone?.includes(search),
      );
    }

    const total = await OrganizationUser.countDocuments(filter);

    return {
      users: staffList,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(auth: AuthContext, id: string): Promise<StaffListItem> {
    const organizationId = requireOrganizationId(auth);
    const orgUser = await OrganizationUser.findOne({
      userId: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    return this.formatStaff(user, orgUser.role, orgUser);
  }

  async update(auth: AuthContext, id: string, input: UpdateUserInput): Promise<StaffListItem> {
    const organizationId = requireOrganizationId(auth);
    const orgUser = await OrganizationUser.findOne({
      userId: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (orgUser.role === ORG_ROLES.OWNER) {
      throw new ForbiddenError('Cannot modify organization owner', ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (input.login && input.login.trim() !== user.login) {
      const existing = await User.findOne({ login: input.login.trim() });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Login already in use', undefined, ERROR_CODES.LOGIN_ALREADY_IN_USE);
      }
      user.login = input.login.trim();
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await User.findOne({ phone: input.phone });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Phone number already in use', undefined, ERROR_CODES.PHONE_ALREADY_IN_USE);
      }
      user.phone = input.phone;
    }

    if (input.name) user.name = input.name;
    if (input.photoUrl !== undefined) user.photoUrl = input.photoUrl || undefined;
    if (input.isActive !== undefined) user.isActive = input.isActive;
    if (input.password) user.passwordHash = input.password;
    if (input.role) orgUser.role = input.role;

    await user.save();
    await orgUser.save();

    return this.formatStaff(user, orgUser.role, orgUser);
  }

  async softDelete(auth: AuthContext, id: string): Promise<StaffListItem> {
    const organizationId = requireOrganizationId(auth);
    const orgUser = await OrganizationUser.findOne({
      userId: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (orgUser.role === ORG_ROLES.OWNER) {
      throw new ForbiddenError('Cannot remove organization owner', ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }

    orgUser.status = ORG_USER_STATUS.DISABLED;
    await orgUser.save();

    const user = await User.findById(id);
    if (user) {
      user.isActive = false;
      await user.save();
      return this.formatStaff(user, orgUser.role, orgUser);
    }

    throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
  }

  private formatStaff(
    user: IUser,
    role: string,
    orgUser?: IOrganizationUser,
  ): StaffListItem {
    return {
      id: user._id.toString(),
      name: user.name,
      login: user.login,
      phone: user.phone,
      photoUrl: user.photoUrl,
      role,
      isActive: user.isActive && orgUser?.status === ORG_USER_STATUS.ACTIVE,
      createdAt: orgUser?.createdAt ?? user.createdAt,
    };
  }
}

export const userService = new UserService();
