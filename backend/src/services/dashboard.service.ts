import { Types } from 'mongoose';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { ROLES } from '../constants/roles';
import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';
import { PaginationMeta } from '../types';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

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
  user?: { name: string; phone?: string };
  event?: { title: string };
  scannedBy?: { name: string };
}

export class DashboardService {
  async getStats(eventId?: string): Promise<DashboardStats> {
    const participantFilter = {
      role: ROLES.PARTICIPANT,
      isActive: true,
    };

    const attendanceFilter: Record<string, unknown> = {};

    if (eventId) {
      attendanceFilter.eventId = new Types.ObjectId(eventId);
    }

    const [totalParticipants, checkedIn, checkedOut] = await Promise.all([
      User.countDocuments(participantFilter),
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
    eventId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ items: RecentActivityItem[]; meta: PaginationMeta }> {
    const pagination = parsePagination(page, limit);
    const filter: Record<string, unknown> = {};

    if (eventId) {
      filter.eventId = new Types.ObjectId(eventId);
    }

    const [items, total] = await Promise.all([
      ScanLog.find(filter)
        .populate('userId', 'name phone')
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
