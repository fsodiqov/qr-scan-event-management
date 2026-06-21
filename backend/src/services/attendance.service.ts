import { FilterQuery, Types } from 'mongoose';
import { Attendance, IAttendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { User } from '../models/User';
import {
  ATTENDANCE_STATUS,
  SCAN_RESULT,
} from '../constants/attendanceStatus';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import {
  CreateAttendanceInput,
  ListAttendanceQuery,
  ScanInput,
  UpdateAttendanceInput,
} from '../validators/attendance.validator';
import { PaginationMeta } from '../types';
import { eventService } from './event.service';
import { qrService } from './qr.service';

export interface AttendanceListResult {
  records: IAttendance[];
  meta: PaginationMeta;
}

export interface ScanResultPayload {
  result: typeof SCAN_RESULT.CHECK_IN | typeof SCAN_RESULT.CHECK_OUT;
  attendance: IAttendance;
  user: {
    id: string;
    name: string;
    phone?: string;
    organization?: string;
  };
  message: string;
}

export class AttendanceService {
  async scan(
    input: ScanInput,
    scannedBy: string,
    metadata?: Record<string, unknown>,
  ): Promise<ScanResultPayload> {
    const { qrToken, eventId } = input;

    await eventService.assertEventActiveForScan(eventId);

    const user = await qrService.validateTokenOrNull(qrToken);

    if (!user) {
      await ScanLog.create({
        eventId: new Types.ObjectId(eventId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.INVALID,
        metadata,
      });
      throw new NotFoundError('Invalid QR token', ERROR_CODES.INVALID_QR_TOKEN);
    }

    if (!user.isActive) {
      await ScanLog.create({
        userId: user._id,
        eventId: new Types.ObjectId(eventId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.INVALID,
        metadata,
      });
      throw new ForbiddenError('Participant account is inactive', ERROR_CODES.PARTICIPANT_INACTIVE);
    }

    const existing = await Attendance.findOne({
      userId: user._id,
      eventId: new Types.ObjectId(eventId),
    });

    if (!existing) {
      const attendance = await Attendance.create({
        userId: user._id,
        eventId: new Types.ObjectId(eventId),
        checkInTime: new Date(),
        status: ATTENDANCE_STATUS.CHECKED_IN,
      });

      await ScanLog.create({
        userId: user._id,
        eventId: new Types.ObjectId(eventId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.CHECK_IN,
        metadata,
      });

      return {
        result: SCAN_RESULT.CHECK_IN,
        attendance,
        user: this.formatUser(user),
        message: 'Check-in successful',
      };
    }

    if (existing.status === ATTENDANCE_STATUS.CHECKED_IN) {
      existing.checkOutTime = new Date();
      existing.status = ATTENDANCE_STATUS.CHECKED_OUT;
      await existing.save();

      await ScanLog.create({
        userId: user._id,
        eventId: new Types.ObjectId(eventId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.CHECK_OUT,
        metadata,
      });

      return {
        result: SCAN_RESULT.CHECK_OUT,
        attendance: existing,
        user: this.formatUser(user),
        message: 'Check-out successful',
      };
    }

    await ScanLog.create({
      userId: user._id,
      eventId: new Types.ObjectId(eventId),
      scannedBy: new Types.ObjectId(scannedBy),
      result: SCAN_RESULT.ALREADY_OUT,
      metadata,
    });

    throw new ConflictError('Already checked out', {
      result: SCAN_RESULT.ALREADY_OUT,
      user: this.formatUser(user),
      attendance: existing,
    }, ERROR_CODES.ALREADY_CHECKED_OUT);
  }

  async create(input: CreateAttendanceInput): Promise<IAttendance> {
    const user = await User.findById(input.userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    await eventService.findById(input.eventId);

    const existing = await Attendance.findOne({
      userId: input.userId,
      eventId: input.eventId,
    });

    if (existing) {
      throw new ConflictError('Attendance record already exists for this user and event', undefined, ERROR_CODES.ATTENDANCE_EXISTS);
    }

    return Attendance.create({
      userId: new Types.ObjectId(input.userId),
      eventId: new Types.ObjectId(input.eventId),
      checkInTime: input.checkInTime ?? new Date(),
      status: input.status ?? ATTENDANCE_STATUS.CHECKED_IN,
    });
  }

  async findAll(query: ListAttendanceQuery): Promise<AttendanceListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter = this.buildFilter(query);

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('userId', 'name phone organization photoUrl')
        .populate('eventId', 'title location eventDate status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(filter),
    ]);

    return {
      records,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<IAttendance> {
    const record = await Attendance.findById(id)
      .populate('userId', 'name phone organization photoUrl')
      .populate('eventId', 'title location eventDate status');

    if (!record) {
      throw new NotFoundError('Attendance record not found', ERROR_CODES.ATTENDANCE_NOT_FOUND);
    }

    return record;
  }

  async findByEvent(eventId: string, query: ListAttendanceQuery): Promise<AttendanceListResult> {
    return this.findAll({ ...query, eventId });
  }

  async findByUser(userId: string, query: ListAttendanceQuery): Promise<AttendanceListResult> {
    return this.findAll({ ...query, userId });
  }

  async update(id: string, input: UpdateAttendanceInput): Promise<IAttendance> {
    const record = await this.findById(id);

    if (input.checkInTime) record.checkInTime = input.checkInTime;
    if (input.checkOutTime) record.checkOutTime = input.checkOutTime;
    if (input.status) record.status = input.status;

    if (
      record.checkInTime &&
      record.checkOutTime &&
      record.checkOutTime <= record.checkInTime
    ) {
      throw new BadRequestError('Check-out time must be after check-in time', undefined, ERROR_CODES.CHECKOUT_BEFORE_CHECKIN);
    }

    await record.save();
    return record;
  }

  async delete(id: string): Promise<void> {
    const record = await this.findById(id);
    await record.deleteOne();
  }

  private buildFilter(query: ListAttendanceQuery): FilterQuery<IAttendance> {
    const filter: FilterQuery<IAttendance> = {};

    if (query.eventId) {
      filter.eventId = new Types.ObjectId(query.eventId);
    }

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    return filter;
  }

  private formatUser(user: {
    _id: Types.ObjectId;
    name: string;
    phone?: string;
    organization?: string;
  }) {
    return {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      organization: user.organization,
    };
  }
}

export const attendanceService = new AttendanceService();
