import { FilterQuery, Types } from 'mongoose';
import { Organization, IOrganization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  UpdateMyOrganizationInput,
  UpdateOrganizationInput,
} from '../validators/organization.validator';
import { PaginationMeta } from '../types';
import { AuthContext } from '../types';
import { requireOrganizationId } from '../utils/tenantScope';
import { generateQrToken } from '../utils/qrToken';
import { processLogoFromDataUriOrUrl, processLogoToDataUri } from '../utils/processLogo';

export interface OrganizationListResult {
  organizations: IOrganization[];
  meta: PaginationMeta;
}

export interface CreateOrganizationOwnerInfo {
  id: string;
  name: string;
  login: string;
}

export interface CreateOrganizationResult {
  organization: IOrganization;
  owner: CreateOrganizationOwnerInfo;
  tempPassword?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export class OrganizationService {
  async create(input: CreateOrganizationInput): Promise<CreateOrganizationResult> {
    const slug = input.slug ?? slugify(input.name);
    const ownerLogin = input.owner.login.trim();

    const existingSlug = await Organization.findOne({ slug });
    if (existingSlug) {
      throw new ConflictError('Organization slug already exists', undefined, ERROR_CODES.SLUG_ALREADY_EXISTS);
    }

    if (input.subscriptionId) {
      const subscription = await Subscription.findById(input.subscriptionId);
      if (!subscription) {
        throw new NotFoundError('Subscription not found', ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
      }
    }

    const existingUser = await User.findOne({ login: ownerLogin });
    if (existingUser) {
      const existingMembership = await OrganizationUser.findOne({ userId: existingUser._id });
      if (existingMembership) {
        throw new ConflictError(
          'User already belongs to an organization',
          undefined,
          ERROR_CODES.USER_ALREADY_IN_ORG,
        );
      }
    }

    const organization = new Organization({
      name: input.name,
      slug,
      logo: input.logo ? await processLogoFromDataUriOrUrl(input.logo) : undefined,
      subscriptionId: input.subscriptionId
        ? new Types.ObjectId(input.subscriptionId)
        : undefined,
    });

    await organization.save();

    const tempPassword = input.owner.password ?? generateQrToken().slice(0, 10);

    try {
      let user = existingUser;

      if (!user) {
        user = new User({
          name: input.owner.name,
          login: ownerLogin,
          phone: input.owner.phone,
          passwordHash: tempPassword,
          isActive: true,
          isSuperAdmin: false,
        });
      } else {
        user.name = input.owner.name;
        if (input.owner.phone) user.phone = input.owner.phone;
        user.passwordHash = input.owner.password ?? tempPassword;
      }

      await user.save();

      await OrganizationUser.create({
        organizationId: organization._id,
        userId: user._id,
        role: ORG_ROLES.OWNER,
        status: ORG_USER_STATUS.ACTIVE,
      });

      return {
        organization,
        owner: {
          id: user._id.toString(),
          name: user.name,
          login: user.login!,
        },
        tempPassword: input.owner.password ? undefined : tempPassword,
      };
    } catch (error) {
      await organization.deleteOne();
      throw error;
    }
  }

  async findAll(query: ListOrganizationsQuery): Promise<OrganizationListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IOrganization> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate('subscriptionId', 'name planCode status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Organization.countDocuments(filter),
    ]);

    return {
      organizations,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<IOrganization> {
    const organization = await Organization.findById(id).populate(
      'subscriptionId',
      'name planCode status',
    );

    if (!organization) {
      throw new NotFoundError('Organization not found', ERROR_CODES.ORGANIZATION_NOT_FOUND);
    }

    return organization;
  }

  async update(id: string, input: UpdateOrganizationInput): Promise<IOrganization> {
    const organization = await this.findById(id);

    if (input.slug && input.slug !== organization.slug) {
      const existingSlug = await Organization.findOne({ slug: input.slug });
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('Organization slug already exists', undefined, ERROR_CODES.SLUG_ALREADY_EXISTS);
      }
      organization.slug = input.slug;
    }

    if (input.name) organization.name = input.name;
    if (input.logo !== undefined) {
      organization.logo = input.logo
        ? await processLogoFromDataUriOrUrl(input.logo)
        : undefined;
    }
    if (input.status) organization.status = input.status;

    if (input.subscriptionId !== undefined) {
      if (input.subscriptionId) {
        const subscription = await Subscription.findById(input.subscriptionId);
        if (!subscription) {
          throw new NotFoundError('Subscription not found', ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
        }
        organization.subscriptionId = new Types.ObjectId(input.subscriptionId);
      } else {
        organization.subscriptionId = undefined;
      }
    }

    await organization.save();
    return organization;
  }

  async updateMyOrganization(
    auth: AuthContext,
    input: UpdateMyOrganizationInput,
  ): Promise<IOrganization> {
    const organizationId = requireOrganizationId(auth);
    const organization = await this.findById(organizationId);

    if (input.name) organization.name = input.name;
    if (input.logo !== undefined) {
      organization.logo = input.logo
        ? await processLogoFromDataUriOrUrl(input.logo)
        : undefined;
    }

    await organization.save();
    return organization;
  }

  async uploadMyLogo(auth: AuthContext, file?: Express.Multer.File): Promise<IOrganization> {
    if (!file?.buffer?.length) {
      throw new BadRequestError('Logo file is required');
    }

    const organizationId = requireOrganizationId(auth);
    const organization = await this.findById(organizationId);
    organization.logo = await processLogoToDataUri(file.buffer);
    await organization.save();
    return organization;
  }

  async getMyOrganization(auth: AuthContext): Promise<IOrganization> {
    const organizationId = requireOrganizationId(auth);
    return this.findById(organizationId);
  }

  async delete(id: string): Promise<void> {
    const organization = await this.findById(id);
    await organization.deleteOne();
  }

  async assertOrganizationAccess(
    auth: AuthContext,
    organizationId: string,
  ): Promise<IOrganization> {
    const organization = await this.findById(organizationId);

    if (auth.organizationId && auth.organizationId !== organizationId) {
      throw new ForbiddenError('Organization access denied', ERROR_CODES.ORG_ACCESS_DENIED);
    }

    return organization;
  }
}

export const organizationService = new OrganizationService();
