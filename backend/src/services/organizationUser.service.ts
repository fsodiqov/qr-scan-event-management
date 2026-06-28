import { FilterQuery, Types } from 'mongoose';
import { User } from '../models/User';
import { OrganizationUser, IOrganizationUser } from '../models/OrganizationUser';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateOrganizationUserInput,
  ListOrganizationUsersQuery,
  UpdateOrganizationUserInput,
} from '../validators/organizationUser.validator';
import { PaginationMeta, AuthContext } from '../types';
import { requireOrganizationId } from '../utils/tenantScope';
import { generateQrToken } from '../utils/qrToken';

export interface OrganizationUserListItem {
  id: string;
  userId: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OrganizationUserListResult {
  members: OrganizationUserListItem[];
  meta: PaginationMeta;
}

export class OrganizationUserService {
  async create(
    auth: AuthContext,
    input: CreateOrganizationUserInput,
  ): Promise<{ member: OrganizationUserListItem; tempPassword?: string }> {
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

    const tempPassword = input.password ?? generateQrToken().slice(0, 10);

    const user = new User({
      name: input.name,
      login: input.login.trim(),
      phone: input.phone,
      photoUrl: input.photoUrl,
      passwordHash: tempPassword,
      isActive: true,
      isSuperAdmin: false,
    });

    await user.save();

    const orgUser = await OrganizationUser.create({
      organizationId: new Types.ObjectId(organizationId),
      userId: user._id,
      role: input.role,
      status: ORG_USER_STATUS.ACTIVE,
    });

    return {
      member: this.formatMember(orgUser, user),
      tempPassword: input.password ? undefined : tempPassword,
    };
  }

  async findAll(
    auth: AuthContext,
    query: ListOrganizationUsersQuery,
  ): Promise<OrganizationUserListResult> {
    const organizationId = requireOrganizationId(auth);
    return this.findAllInOrganization(organizationId, query);
  }

  async findAllInOrganization(
    organizationId: string,
    query: ListOrganizationUsersQuery,
  ): Promise<OrganizationUserListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const filter: FilterQuery<IOrganizationUser> = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    const orgUsers = await OrganizationUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const userIds = orgUsers.map((ou) => ou.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    let members = orgUsers.map((ou) => {
      const user = userMap.get(ou.userId.toString());
      return this.formatMember(ou, user!);
    });

    if (query.search) {
      const search = query.search.toLowerCase();
      members = members.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.login?.toLowerCase().includes(search) ||
          m.phone?.includes(search),
      );
    }

    const total = await OrganizationUser.countDocuments(filter);

    return {
      members,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(auth: AuthContext, id: string): Promise<OrganizationUserListItem> {
    const organizationId = requireOrganizationId(auth);
    const orgUser = await OrganizationUser.findOne({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('Organization user not found', ERROR_CODES.ORG_USER_NOT_FOUND);
    }

    const user = await User.findById(orgUser.userId);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    return this.formatMember(orgUser, user);
  }

  async update(
    auth: AuthContext,
    id: string,
    input: UpdateOrganizationUserInput,
  ): Promise<OrganizationUserListItem> {
    const organizationId = requireOrganizationId(auth);
    return this.updateInOrganization(organizationId, id, input);
  }

  async updateInOrganization(
    organizationId: string,
    id: string,
    input: UpdateOrganizationUserInput,
    options: { allowOwnerEdit?: boolean } = {},
  ): Promise<OrganizationUserListItem> {
    const orgUser = await OrganizationUser.findOne({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('Organization user not found', ERROR_CODES.ORG_USER_NOT_FOUND);
    }

    if (orgUser.role === ORG_ROLES.OWNER && !options.allowOwnerEdit) {
      throw new ForbiddenError('Cannot modify organization owner', ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }

    const user = await User.findById(orgUser.userId);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (input.login && input.login.trim() !== user.login) {
      const existing = await User.findOne({ login: input.login.trim() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new ConflictError('Login already in use', undefined, ERROR_CODES.LOGIN_ALREADY_IN_USE);
      }
      user.login = input.login.trim();
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await User.findOne({ phone: input.phone });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new ConflictError('Phone number already in use', undefined, ERROR_CODES.PHONE_ALREADY_IN_USE);
      }
      user.phone = input.phone;
    }

    if (input.name) user.name = input.name;
    if (input.photoUrl !== undefined) user.photoUrl = input.photoUrl ?? undefined;
    if (input.password) user.passwordHash = input.password;
    if (input.isActive !== undefined) user.isActive = input.isActive;
    if (input.role) orgUser.role = input.role;
    if (input.status) orgUser.status = input.status;

    await user.save();
    await orgUser.save();

    return this.formatMember(orgUser, user);
  }

  async remove(auth: AuthContext, id: string): Promise<void> {
    const organizationId = requireOrganizationId(auth);
    const orgUser = await OrganizationUser.findOne({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!orgUser) {
      throw new NotFoundError('Organization user not found', ERROR_CODES.ORG_USER_NOT_FOUND);
    }

    if (orgUser.role === ORG_ROLES.OWNER) {
      const ownerCount = await OrganizationUser.countDocuments({
        organizationId: orgUser.organizationId,
        role: ORG_ROLES.OWNER,
        status: ORG_USER_STATUS.ACTIVE,
      });

      if (ownerCount <= 1) {
        throw new BadRequestError(
          'Cannot remove the last organization owner',
          undefined,
          ERROR_CODES.CANNOT_REMOVE_LAST_OWNER,
        );
      }
    }

    orgUser.status = ORG_USER_STATUS.DISABLED;
    await orgUser.save();

    const user = await User.findById(orgUser.userId);
    if (user) {
      user.isActive = false;
      await user.save();
    }
  }

  private formatMember(
    orgUser: IOrganizationUser,
    user: { name: string; login?: string; phone?: string; photoUrl?: string; isActive: boolean },
  ): OrganizationUserListItem {
    return {
      id: orgUser._id.toString(),
      userId: orgUser.userId.toString(),
      name: user.name,
      login: user.login,
      phone: user.phone,
      photoUrl: user.photoUrl,
      role: orgUser.role,
      status: orgUser.status,
      isActive: user.isActive,
      createdAt: orgUser.createdAt,
    };
  }
}

export const organizationUserService = new OrganizationUserService();
