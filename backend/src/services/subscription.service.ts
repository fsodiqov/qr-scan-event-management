import { FilterQuery } from 'mongoose';
import { Subscription, ISubscription } from '../models/Subscription';
import {
  SUBSCRIPTION_STATUS,
} from '../constants/subscriptionStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import { NotFoundError } from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateSubscriptionInput,
  ListSubscriptionsQuery,
  UpdateSubscriptionInput,
} from '../validators/subscription.validator';
import { PaginationMeta } from '../types';

export interface SubscriptionListResult {
  subscriptions: ISubscription[];
  meta: PaginationMeta;
}

export class SubscriptionService {
  async create(input: CreateSubscriptionInput): Promise<ISubscription> {
    const subscription = new Subscription({
      name: input.name,
      planCode: input.planCode,
      status: input.status ?? SUBSCRIPTION_STATUS.ACTIVE,
      limits: input.limits,
    });

    await subscription.save();
    return subscription;
  }

  async findAll(query: ListSubscriptionsQuery): Promise<SubscriptionListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<ISubscription> = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Subscription.countDocuments(filter),
    ]);

    return {
      subscriptions,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<ISubscription> {
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      throw new NotFoundError('Subscription not found', ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
    }

    return subscription;
  }

  async update(id: string, input: UpdateSubscriptionInput): Promise<ISubscription> {
    const subscription = await this.findById(id);

    if (input.name) subscription.name = input.name;
    if (input.status) subscription.status = input.status;
    if (input.limits !== undefined) subscription.limits = input.limits;

    await subscription.save();
    return subscription;
  }

  async getStarterPlan(): Promise<ISubscription | null> {
    return Subscription.findOne({
      planCode: 'starter',
      status: SUBSCRIPTION_STATUS.ACTIVE,
    });
  }
}

export const subscriptionService = new SubscriptionService();
