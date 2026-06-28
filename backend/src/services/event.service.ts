import { FilterQuery, Types } from 'mongoose';
import { Event, IEvent } from '../models/Event';
import { Attendance } from '../models/Attendance';
import { EVENT_STATUS } from '../constants/eventStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from '../validators/event.validator';
import { EventStatus } from '../constants/eventStatus';
import { PaginationMeta, AuthContext } from '../types';
import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';
import { requireOrganizationId, scopeToOrganization } from '../utils/tenantScope';

export interface EventListResult {
  events: IEvent[];
  meta: PaginationMeta;
}

export interface EventDetailResult {
  event: IEvent;
  stats: {
    totalAttendance: number;
    checkedIn: number;
    checkedOut: number;
    currentlyInside: number;
  };
}

export class EventService {
  async create(
    input: CreateEventInput,
    auth: AuthContext,
  ): Promise<IEvent> {
    const organizationId = requireOrganizationId(auth);

    const event = new Event({
      ...input,
      status: input.status ?? EVENT_STATUS.DRAFT,
      organizationId: new Types.ObjectId(organizationId),
      createdBy: new Types.ObjectId(auth.userId),
    });

    await event.save();
    return event;
  }

  async findAll(auth: AuthContext, query: ListEventsQuery): Promise<EventListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const filter: FilterQuery<IEvent> = scopeToOrganization(
      auth,
      {},
    ) as FilterQuery<IEvent>;

    if (query.status) {
      filter.status = query.status;
    }

    if (query.from || query.to) {
      filter.eventDate = {};
      if (query.from) filter.eventDate.$gte = query.from;
      if (query.to) filter.eventDate.$lte = query.to;
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('createdBy', 'name login')
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    return {
      events,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(auth: AuthContext, id: string): Promise<IEvent> {
    const filter = scopeToOrganization(auth, { _id: id });
    const event = await Event.findOne(filter).populate('createdBy', 'name login');

    if (!event) {
      throw new NotFoundError('Event not found', ERROR_CODES.EVENT_NOT_FOUND);
    }

    return event;
  }

  async findByIdWithStats(auth: AuthContext, id: string): Promise<EventDetailResult> {
    const event = await this.findById(auth, id);

    const [totalAttendance, checkedIn, checkedOut] = await Promise.all([
      Attendance.countDocuments({ eventId: id }),
      Attendance.countDocuments({
        eventId: id,
        status: ATTENDANCE_STATUS.CHECKED_IN,
      }),
      Attendance.countDocuments({
        eventId: id,
        status: ATTENDANCE_STATUS.CHECKED_OUT,
      }),
    ]);

    return {
      event,
      stats: {
        totalAttendance,
        checkedIn,
        checkedOut,
        currentlyInside: checkedIn,
      },
    };
  }

  async update(auth: AuthContext, id: string, input: UpdateEventInput): Promise<IEvent> {
    const event = await this.findById(auth, id);

    if (input.title) event.title = input.title;
    if (input.description !== undefined) event.description = input.description;
    if (input.location) event.location = input.location;
    if (input.eventDate) event.eventDate = input.eventDate;
    if (input.status) event.status = input.status;

    await event.save();
    return event;
  }

  async updateStatus(auth: AuthContext, id: string, status: EventStatus): Promise<IEvent> {
    const event = await this.findById(auth, id);
    event.status = status;
    await event.save();
    return event;
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const event = await this.findById(auth, id);

    const attendanceCount = await Attendance.countDocuments({ eventId: id });

    if (attendanceCount > 0) {
      throw new ConflictError(
        'Cannot delete event with existing attendance records',
        undefined,
        ERROR_CODES.EVENT_HAS_ATTENDANCE,
      );
    }

    await event.deleteOne();
  }

  async assertEventActiveForScan(auth: AuthContext, eventId: string): Promise<IEvent> {
    const event = await this.findById(auth, eventId);

    if (event.status === EVENT_STATUS.CLOSED) {
      throw new BadRequestError('Event is closed', undefined, ERROR_CODES.EVENT_CLOSED);
    }

    if (event.status !== EVENT_STATUS.ACTIVE) {
      throw new BadRequestError('Event is not active for scanning', undefined, ERROR_CODES.EVENT_NOT_ACTIVE);
    }

    return event;
  }
}

export const eventService = new EventService();
