import { Types } from 'mongoose';
import { Participant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';
import { PaginationMeta, AuthContext } from '../types';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { requireOrganizationId, scopeToOrganization } from '../utils/tenantScope';

export interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
}

export interface RecentActivityItem {
  _id: Types.ObjectId;
  result: string;
  scannedAt: Date;
  participant?: { name: string; phone?: string };
  event?: { title: string };
  scannedBy?: { name: string };
}

export class DashboardService {
  async getStats(auth: AuthContext, eventId?: string): Promise<DashboardStats> {
    const organizationId = requireOrganizationId(auth);

    const participantFilter: Record<string, unknown> = {
      organizationId: new Types.ObjectId(organizationId),
      isActive: true,
    };

    const attendanceFilter: Record<string, unknown> = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (eventId) {
      participantFilter.eventId = new Types.ObjectId(eventId);
      attendanceFilter.eventId = new Types.ObjectId(eventId);
    }

    const [totalParticipants, checkedIn, checkedOut] = await Promise.all([
      Participant.countDocuments(participantFilter),
      Attendance.countDocuments({
        ...attendanceFilter,
        status: ATTENDANCE_STATUS.CHECKED_IN,
      }),
      Attendance.countDocuments({
        ...attendanceFilter,
        status: ATTENDANCE_STATUS.CHECKED_OUT,
      }),
    ]);

    return {
      totalParticipants,
      checkedIn,
      checkedOut,
      currentlyInside: checkedIn,
    };
  }

  async getRecentActivity(
    auth: AuthContext,
    eventId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ items: RecentActivityItem[]; meta: PaginationMeta }> {
    const pagination = parsePagination(page, limit);
    const filter: Record<string, unknown> = scopeToOrganization(auth, {});

    if (eventId) {
      filter.eventId = new Types.ObjectId(eventId);
    }

    const [items, total] = await Promise.all([
      ScanLog.find(filter)
        .populate('participantId', 'name phone')
        .populate('eventId', 'title')
        .populate('scannedBy', 'name')
        .sort({ scannedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ScanLog.countDocuments(filter),
    ]);

    return {
      items: items as unknown as RecentActivityItem[],
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }
}

export const dashboardService = new DashboardService();
