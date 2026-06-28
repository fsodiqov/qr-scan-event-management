import { FilterQuery, Types } from 'mongoose';
import { Attendance, IAttendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { Participant } from '../models/Participant';
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
import { PaginationMeta, AuthContext } from '../types';
import { eventService } from './event.service';
import { qrService } from './qr.service';
import { participantService } from './participant.service';
import { requireOrganizationId, scopeToOrganization } from '../utils/tenantScope';

export interface AttendanceListResult {
  records: IAttendance[];
  meta: PaginationMeta;
}

export interface ScanResultPayload {
  result: typeof SCAN_RESULT.CHECK_IN | typeof SCAN_RESULT.CHECK_OUT;
  attendance: IAttendance;
  participant: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  message: string;
}

export class AttendanceService {
  async scan(
    auth: AuthContext,
    input: ScanInput,
    scannedBy: string,
    metadata?: Record<string, unknown>,
  ): Promise<ScanResultPayload> {
    const { qrToken, eventId } = input;
    const organizationId = requireOrganizationId(auth);

    const event = await eventService.assertEventActiveForScan(auth, eventId);

    const participant = await qrService.validateTokenOrNull(qrToken);

    if (!participant) {
      await ScanLog.create({
        eventId: new Types.ObjectId(eventId),
        organizationId: new Types.ObjectId(organizationId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.INVALID,
        metadata,
      });
      throw new NotFoundError('Invalid QR token', ERROR_CODES.INVALID_QR_TOKEN);
    }

    if (!participant.isActive) {
      await ScanLog.create({
        participantId: participant._id,
        eventId: new Types.ObjectId(eventId),
        organizationId: new Types.ObjectId(organizationId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.INVALID,
        metadata,
      });
      throw new ForbiddenError('Participant is inactive', ERROR_CODES.PARTICIPANT_INACTIVE);
    }

    await participantService.assertParticipantInEvent(
      participant,
      eventId,
      organizationId,
    );

    const existing = await Attendance.findOne({
      participantId: participant._id,
      eventId: new Types.ObjectId(eventId),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!existing) {
      const attendance = await Attendance.create({
        participantId: participant._id,
        eventId: new Types.ObjectId(eventId),
        organizationId: event.organizationId,
        checkInTime: new Date(),
        status: ATTENDANCE_STATUS.CHECKED_IN,
      });

      await ScanLog.create({
        participantId: participant._id,
        eventId: new Types.ObjectId(eventId),
        organizationId: new Types.ObjectId(organizationId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.CHECK_IN,
        metadata,
      });

      return {
        result: SCAN_RESULT.CHECK_IN,
        attendance,
        participant: this.formatParticipant(participant),
        message: 'Check-in successful',
      };
    }

    if (existing.status === ATTENDANCE_STATUS.CHECKED_IN) {
      existing.checkOutTime = new Date();
      existing.status = ATTENDANCE_STATUS.CHECKED_OUT;
      await existing.save();

      await ScanLog.create({
        participantId: participant._id,
        eventId: new Types.ObjectId(eventId),
        organizationId: new Types.ObjectId(organizationId),
        scannedBy: new Types.ObjectId(scannedBy),
        result: SCAN_RESULT.CHECK_OUT,
        metadata,
      });

      return {
        result: SCAN_RESULT.CHECK_OUT,
        attendance: existing,
        participant: this.formatParticipant(participant),
        message: 'Check-out successful',
      };
    }

    await ScanLog.create({
      participantId: participant._id,
      eventId: new Types.ObjectId(eventId),
      organizationId: new Types.ObjectId(organizationId),
      scannedBy: new Types.ObjectId(scannedBy),
      result: SCAN_RESULT.ALREADY_OUT,
      metadata,
    });

    throw new ConflictError('Already checked out', {
      result: SCAN_RESULT.ALREADY_OUT,
      participant: this.formatParticipant(participant),
      attendance: existing,
    }, ERROR_CODES.ALREADY_CHECKED_OUT);
  }

  async create(auth: AuthContext, input: CreateAttendanceInput): Promise<IAttendance> {
    const organizationId = requireOrganizationId(auth);

    const participant = await Participant.findOne({
      _id: input.participantId,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!participant || !participant.isActive) {
      throw new NotFoundError('Participant not found', ERROR_CODES.PARTICIPANT_NOT_FOUND);
    }

    const event = await eventService.findById(auth, input.eventId);

    await participantService.assertParticipantInEvent(
      participant,
      input.eventId,
      organizationId,
    );

    const existing = await Attendance.findOne({
      participantId: input.participantId,
      eventId: input.eventId,
    });

    if (existing) {
      throw new ConflictError('Attendance record already exists for this participant and event', undefined, ERROR_CODES.ATTENDANCE_EXISTS);
    }

    return Attendance.create({
      participantId: new Types.ObjectId(input.participantId),
      eventId: new Types.ObjectId(input.eventId),
      organizationId: event.organizationId,
      checkInTime: input.checkInTime ?? new Date(),
      status: input.status ?? ATTENDANCE_STATUS.CHECKED_IN,
    });
  }

  async findAll(auth: AuthContext, query: ListAttendanceQuery): Promise<AttendanceListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter = this.buildFilter(auth, query);

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('participantId', 'name phone email photoUrl')
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

  async findById(auth: AuthContext, id: string): Promise<IAttendance> {
    const filter = scopeToOrganization(auth, { _id: id });
    const record = await Attendance.findOne(filter)
      .populate('participantId', 'name phone email photoUrl')
      .populate('eventId', 'title location eventDate status');

    if (!record) {
      throw new NotFoundError('Attendance record not found', ERROR_CODES.ATTENDANCE_NOT_FOUND);
    }

    return record;
  }

  async findByEvent(auth: AuthContext, eventId: string, query: ListAttendanceQuery): Promise<AttendanceListResult> {
    return this.findAll(auth, { ...query, eventId });
  }

  async findByParticipant(auth: AuthContext, participantId: string, query: ListAttendanceQuery): Promise<AttendanceListResult> {
    return this.findAll(auth, { ...query, participantId });
  }

  async update(auth: AuthContext, id: string, input: UpdateAttendanceInput): Promise<IAttendance> {
    const record = await this.findById(auth, id);

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

  async delete(auth: AuthContext, id: string): Promise<void> {
    const record = await this.findById(auth, id);
    await record.deleteOne();
  }

  private buildFilter(auth: AuthContext, query: ListAttendanceQuery): FilterQuery<IAttendance> {
    const filter: FilterQuery<IAttendance> = scopeToOrganization(
      auth,
      {},
    ) as FilterQuery<IAttendance>;

    if (query.eventId) {
      filter.eventId = new Types.ObjectId(query.eventId);
    }

    if (query.participantId) {
      filter.participantId = new Types.ObjectId(query.participantId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    return filter;
  }

  private formatParticipant(participant: {
    _id: Types.ObjectId;
    name: string;
    phone?: string;
    email?: string;
  }) {
    return {
      id: participant._id.toString(),
      name: participant.name,
      phone: participant.phone,
      email: participant.email,
    };
  }
}

export const attendanceService = new AttendanceService();
