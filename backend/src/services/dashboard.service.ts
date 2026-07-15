import { Types } from 'mongoose';
import { Participant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { Event } from '../models/Event';
import { ATTENDANCE_STATUS, SCAN_RESULT } from '../constants/attendanceStatus';
import { EVENT_STATUS } from '../constants/eventStatus';
import { PaginationMeta, AuthContext } from '../types';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { requireOrganizationId, scopeToOrganization } from '../utils/tenantScope';
import type { DashboardReportQuery } from '../validators/dashboard.validator';

export interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
  activeEvents: number;
  scansToday: number;
  invalidScansToday: number;
  checkInRate: number;
}

export interface ReportTrendPoint {
  date: string;
  scans: number;
  checkIns: number;
  checkOuts: number;
  invalid: number;
}

export interface ReportResultBreakdown {
  check_in: number;
  check_out: number;
  already_out: number;
  invalid: number;
}

export interface DashboardReport {
  from: string;
  to: string;
  stats: DashboardStats;
  trend: ReportTrendPoint[];
  byResult: ReportResultBreakdown;
}

export interface RecentActivityItem {
  _id: Types.ObjectId;
  result: string;
  scannedAt: Date;
  participant?: { name: string; phone?: string };
  event?: { title: string };
  scannedBy?: { name: string };
}

function resolveReportRange(query: DashboardReportQuery): { from: Date; to: Date } {
  const to = query.to ? new Date(query.to) : new Date();
  to.setMilliseconds(999);

  if (query.from) {
    const from = new Date(query.from);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  const from = new Date(to);
  const period = query.period ?? 'week';

  if (period === 'day') {
    from.setTime(to.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    from.setTime(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    from.setTime(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { from, to };
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export class DashboardService {
  async getStats(auth: AuthContext, eventId?: string): Promise<DashboardStats> {
    const organizationId = requireOrganizationId(auth);
    const orgObjectId = new Types.ObjectId(organizationId);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.computeStats(orgObjectId, eventId, since, new Date());
  }

  async getReport(auth: AuthContext, query: DashboardReportQuery): Promise<DashboardReport> {
    const organizationId = requireOrganizationId(auth);
    const orgObjectId = new Types.ObjectId(organizationId);
    const { from, to } = resolveReportRange(query);

    const [stats, scanDocs] = await Promise.all([
      this.computeStats(orgObjectId, query.eventId, from, to),
      ScanLog.find({
        organizationId: orgObjectId,
        scannedAt: { $gte: from, $lte: to },
        ...(query.eventId ? { eventId: new Types.ObjectId(query.eventId) } : {}),
      })
        .select('result scannedAt')
        .lean(),
    ]);

    const byResult: ReportResultBreakdown = {
      check_in: 0,
      check_out: 0,
      already_out: 0,
      invalid: 0,
    };

    const trendMap = new Map<string, ReportTrendPoint>();
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(to);
    endDay.setHours(0, 0, 0, 0);

    while (cursor <= endDay) {
      const key = toDateKey(cursor);
      trendMap.set(key, {
        date: key,
        scans: 0,
        checkIns: 0,
        checkOuts: 0,
        invalid: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const scan of scanDocs) {
      const result = scan.result as keyof ReportResultBreakdown;
      if (result in byResult) {
        byResult[result] += 1;
      }

      const key = toDateKey(new Date(scan.scannedAt));
      const point = trendMap.get(key);
      if (!point) continue;

      point.scans += 1;
      if (result === SCAN_RESULT.CHECK_IN) point.checkIns += 1;
      if (result === SCAN_RESULT.CHECK_OUT) point.checkOuts += 1;
      if (result === SCAN_RESULT.INVALID) point.invalid += 1;
    }

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      stats,
      trend: Array.from(trendMap.values()),
      byResult,
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

  private async computeStats(
    orgObjectId: Types.ObjectId,
    eventId: string | undefined,
    from: Date,
    to: Date,
  ): Promise<DashboardStats> {
    const participantFilter: Record<string, unknown> = {
      organizationId: orgObjectId,
      isActive: true,
    };

    const attendanceFilter: Record<string, unknown> = {
      organizationId: orgObjectId,
    };

    const scanFilter: Record<string, unknown> = {
      organizationId: orgObjectId,
      scannedAt: { $gte: from, $lte: to },
    };

    const eventFilter: Record<string, unknown> = {
      organizationId: orgObjectId,
      status: EVENT_STATUS.ACTIVE,
    };

    if (eventId) {
      const eventObjectId = new Types.ObjectId(eventId);
      participantFilter.eventId = eventObjectId;
      attendanceFilter.eventId = eventObjectId;
      scanFilter.eventId = eventObjectId;
    }

    const [
      totalParticipants,
      checkedIn,
      checkedOut,
      activeEvents,
      scansToday,
      invalidScansToday,
    ] = await Promise.all([
      Participant.countDocuments(participantFilter),
      Attendance.countDocuments({
        ...attendanceFilter,
        status: ATTENDANCE_STATUS.CHECKED_IN,
      }),
      Attendance.countDocuments({
        ...attendanceFilter,
        status: ATTENDANCE_STATUS.CHECKED_OUT,
      }),
      eventId ? Promise.resolve(0) : Event.countDocuments(eventFilter),
      ScanLog.countDocuments(scanFilter),
      ScanLog.countDocuments({
        ...scanFilter,
        result: SCAN_RESULT.INVALID,
      }),
    ]);

    const attended = checkedIn + checkedOut;
    const checkInRate =
      totalParticipants > 0 ? Math.round((attended / totalParticipants) * 100) : 0;

    return {
      totalParticipants,
      checkedIn,
      checkedOut,
      currentlyInside: checkedIn,
      activeEvents: eventId ? 1 : activeEvents,
      scansToday,
      invalidScansToday,
      checkInRate,
    };
  }
}

export const dashboardService = new DashboardService();
