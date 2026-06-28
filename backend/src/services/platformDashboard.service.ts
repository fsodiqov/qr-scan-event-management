import { Organization } from '../models/Organization';
import { Event } from '../models/Event';
import { Participant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { Subscription } from '../models/Subscription';
import { ORGANIZATION_STATUS } from '../constants/organizationStatus';
import { SUBSCRIPTION_STATUS } from '../constants/subscriptionStatus';

export interface PlatformDashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalEvents: number;
  totalParticipants: number;
  totalAttendanceRecords: number;
}

export class PlatformDashboardService {
  async getStats(): Promise<PlatformDashboardStats> {
    const [
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      totalSubscriptions,
      activeSubscriptions,
      totalEvents,
      totalParticipants,
      totalAttendanceRecords,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: ORGANIZATION_STATUS.ACTIVE }),
      Organization.countDocuments({ status: ORGANIZATION_STATUS.SUSPENDED }),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
      Event.countDocuments(),
      Participant.countDocuments({ isActive: true }),
      Attendance.countDocuments(),
    ]);

    return {
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      totalSubscriptions,
      activeSubscriptions,
      totalEvents,
      totalParticipants,
      totalAttendanceRecords,
    };
  }
}

export const platformDashboardService = new PlatformDashboardService();
