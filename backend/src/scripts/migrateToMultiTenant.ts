/**
 * One-time migration from single-tenant MVP schema to multi-tenant SaaS schema.
 * Run against a database backup: tsx src/scripts/migrateToMultiTenant.ts
 */
import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { Subscription } from '../models/Subscription';
import { Participant } from '../models/Participant';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import {
  SUBSCRIPTION_PLAN_CODE,
  SUBSCRIPTION_STATUS,
} from '../constants/subscriptionStatus';
import { generateQrToken } from '../utils/qrToken';

const DEFAULT_ORG_NAME = process.env.MIGRATE_ORG_NAME ?? 'Default Organization';
const DEFAULT_ORG_SLUG = process.env.MIGRATE_ORG_SLUG ?? 'default';
const PROMOTE_SUPER_ADMIN_EMAIL = process.env.MIGRATE_SUPER_ADMIN_EMAIL;

interface LegacyUser {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  passwordHash?: string;
  organization?: string;
  role?: string;
  qrToken?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

interface LegacyAttendance {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  participantId?: Types.ObjectId;
  eventId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: string;
}

async function syncCollectionIndexes(db: ReturnType<typeof User.db>): Promise<void> {
  const legacyIndexes = [
    { collection: 'attendances', index: 'userId_1_eventId_1' },
    { collection: 'scanlogs', index: 'userId_1_scannedAt_-1' },
    { collection: 'users', index: 'role_1_isActive_1' },
  ];

  for (const { collection, index } of legacyIndexes) {
    try {
      await db.collection(collection).dropIndex(index);
      console.log(`Dropped legacy index ${index} on ${collection}`);
    } catch {
      // Index may not exist
    }
  }

  await Attendance.syncIndexes();
  await ScanLog.syncIndexes();
  await Participant.syncIndexes();
  await Event.syncIndexes();
  await User.syncIndexes();
  await Organization.syncIndexes();
  await OrganizationUser.syncIndexes();
  await Subscription.syncIndexes();
  console.log('Synced collection indexes');
}

async function migrate(): Promise<void> {
  await connectDB();

  const db = User.db;
  await syncCollectionIndexes(db);

  const usersCollection = db.collection('users');

  let subscription = await Subscription.findOne({ planCode: SUBSCRIPTION_PLAN_CODE.STARTER });
  if (!subscription) {
    subscription = await Subscription.create({
      name: 'Starter Plan',
      planCode: SUBSCRIPTION_PLAN_CODE.STARTER,
      status: SUBSCRIPTION_STATUS.ACTIVE,
    });
    console.log('Created starter subscription');
  }

  let organization = await Organization.findOne({ slug: DEFAULT_ORG_SLUG });
  if (!organization) {
    organization = await Organization.create({
      name: DEFAULT_ORG_NAME,
      slug: DEFAULT_ORG_SLUG,
      subscriptionId: subscription._id,
    });
    console.log(`Created default organization: ${DEFAULT_ORG_NAME}`);
  }

  const organizationId = organization._id;
  const legacyUsers = (await usersCollection.find({}).toArray()) as unknown as LegacyUser[];

  let ownerAssigned = await OrganizationUser.exists({
    organizationId,
    role: ORG_ROLES.OWNER,
    status: ORG_USER_STATUS.ACTIVE,
  });

  const participantMap = new Map<string, Types.ObjectId>();

  for (const legacyUser of legacyUsers) {
    const updates: Record<string, unknown> = {};
    const isLegacyAdmin = legacyUser.role === 'admin';
    const isLegacyParticipant = legacyUser.role === 'participant';

    if (legacyUser.role !== undefined) {
      updates.$unset = {
        role: '',
        organization: '',
        qrToken: '',
      };
    }

    if (PROMOTE_SUPER_ADMIN_EMAIL && legacyUser.email === PROMOTE_SUPER_ADMIN_EMAIL) {
      updates.$set = { ...(updates.$set as object), isSuperAdmin: true };
    } else if (legacyUser.isSuperAdmin === undefined) {
      updates.$set = { ...(updates.$set as object), isSuperAdmin: false };
    }

    if (Object.keys(updates).length > 0) {
      await usersCollection.updateOne({ _id: legacyUser._id }, updates);
    }

    if (isLegacyAdmin) {
      const existingMembership = await OrganizationUser.findOne({ userId: legacyUser._id });
      if (!existingMembership) {
        const role = ownerAssigned ? ORG_ROLES.ADMIN : ORG_ROLES.OWNER;
        await OrganizationUser.create({
          organizationId,
          userId: legacyUser._id,
          role,
          status: ORG_USER_STATUS.ACTIVE,
        });
        if (!ownerAssigned) ownerAssigned = true;
        console.log(`Migrated admin user ${legacyUser.email ?? legacyUser._id} as ${role}`);
      }
    }

    if (isLegacyParticipant && legacyUser.qrToken) {
      participantMap.set(legacyUser._id.toString(), legacyUser._id);
    }
  }

  await Event.updateMany(
    { organizationId: { $exists: false } },
    { $set: { organizationId } },
  );
  console.log('Updated events with organizationId');

  const attendancesCollection = db.collection('attendances');
  const legacyAttendances = (await attendancesCollection.find({}).toArray()) as unknown as LegacyAttendance[];

  for (const record of legacyAttendances) {
    if (record.participantId && record.organizationId) {
      continue;
    }

    const legacyUserId = record.userId?.toString();
    if (!legacyUserId) {
      console.warn(`Skipping attendance ${record._id}: no userId`);
      continue;
    }

    const legacyUser = legacyUsers.find((u) => u._id.toString() === legacyUserId);
    if (!legacyUser) {
      console.warn(`Skipping attendance ${record._id}: user not found`);
      continue;
    }

    let participantId = participantMap.get(`${legacyUserId}:${record.eventId.toString()}`);

    if (!participantId) {
      const existingParticipant = await Participant.findOne({
        organizationId,
        eventId: record.eventId,
        phone: legacyUser.phone,
      });

      if (existingParticipant) {
        participantId = existingParticipant._id;
      } else {
        const participant = await Participant.create({
          organizationId,
          eventId: record.eventId,
          name: legacyUser.name,
          email: legacyUser.email,
          phone: legacyUser.phone,
          photoUrl: legacyUser.photoUrl,
          qrToken: legacyUser.qrToken ?? generateQrToken(),
          isActive: legacyUser.isActive ?? true,
        });
        participantId = participant._id;
      }

      participantMap.set(`${legacyUserId}:${record.eventId.toString()}`, participantId);
    }

    await attendancesCollection.updateOne(
      { _id: record._id },
      {
        $set: {
          participantId,
          organizationId,
        },
        $unset: {
          userId: '',
        },
      },
    );
  }
  console.log(`Migrated ${legacyAttendances.length} attendance records`);

  await ScanLog.updateMany(
    { organizationId: { $exists: false } },
    { $set: { organizationId } },
  );

  const scanLogsCollection = db.collection('scanlogs');
  const legacyScanLogs = await scanLogsCollection.find({ userId: { $exists: true } }).toArray();

  for (const log of legacyScanLogs) {
    const legacyUserId = log.userId?.toString();
    if (!legacyUserId || !log.eventId) continue;

    const key = `${legacyUserId}:${log.eventId.toString()}`;
    let participantId = participantMap.get(key);

    if (!participantId) {
      const legacyUser = legacyUsers.find((u) => u._id.toString() === legacyUserId);
      if (!legacyUser) continue;

      const participant = await Participant.findOne({
        organizationId,
        eventId: log.eventId,
        phone: legacyUser.phone,
      });

      if (participant) {
        participantId = participant._id;
        participantMap.set(key, participantId);
      }
    }

    if (participantId) {
      await scanLogsCollection.updateOne(
        { _id: log._id },
        {
          $set: { participantId, organizationId },
          $unset: { userId: '' },
        },
      );
    }
  }
  console.log(`Migrated ${legacyScanLogs.length} scan logs`);

  console.log('\nMigration complete.');
  console.log(`Organization: ${organization.name} (${organization.slug})`);
  console.log('All users must re-login to receive new JWT tokens.');

  await disconnectDB();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
