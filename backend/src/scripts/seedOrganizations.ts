import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { subscriptionService } from '../services/subscription.service';
import { ORG_ROLES, OrgRole } from '../constants/roles';
import { EVENT_STATUS, EventStatus } from '../constants/eventStatus';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { SUBSCRIPTION_PLAN_CODE } from '../constants/subscriptionStatus';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { Event } from '../models/Event';
import { Participant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { generateQrToken } from '../utils/qrToken';
import { upsertSeedUser } from './seedUserUtils';
import { runSeed } from './seed';

const SHOULD_RESET = process.env.SEED_RESET === 'true';
const PARTICIPANTS_PER_EVENT = 15;

interface OrgMemberSpec {
  login: string;
  password: string;
  name: string;
  role: OrgRole;
}

interface EventSpec {
  title: string;
  description: string;
  location: string;
  daysFromNow: number;
  hours?: number;
  status: EventStatus;
}

interface OrgSpec {
  name: string;
  slug: string;
  members: OrgMemberSpec[];
  events: EventSpec[];
}

const EXTRA_ORGS: OrgSpec[] = [
  {
    name: 'IT Park Events',
    slug: 'itpark-events',
    members: [
      { login: 'itpark-owner', password: 'itpark123456', name: 'IT Park Owner', role: ORG_ROLES.OWNER },
      { login: 'itpark-admin', password: 'itpark123456', name: 'IT Park Admin', role: ORG_ROLES.ADMIN },
      { login: 'itpark-operator', password: 'itpark123456', name: 'IT Park Operator', role: ORG_ROLES.OPERATOR },
    ],
    events: [
      {
        title: 'Tech Meetup Tashkent',
        description: 'Mahalliy dasturchilar uchun oylik meetup.',
        location: 'IT Park Hub A',
        daysFromNow: 0,
        hours: 18,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'Product Design Sprint',
        description: 'UX/UI jamoalar uchun amaliy sprint.',
        location: 'IT Park Hub B',
        daysFromNow: 10,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'DevOps Night',
        description: 'CI/CD va cloud amaliyotlari.',
        location: 'IT Park Conference Hall',
        daysFromNow: -12,
        status: EVENT_STATUS.CLOSED,
      },
      {
        title: 'Founders Breakfast',
        description: 'Startup asoschilari uchun nonushta sessiyasi.',
        location: 'IT Park Cafe',
        daysFromNow: 25,
        status: EVENT_STATUS.DRAFT,
      },
    ],
  },
  {
    name: 'Edu Summit Group',
    slug: 'edu-summit',
    members: [
      { login: 'edu-owner', password: 'edu123456', name: 'Edu Summit Owner', role: ORG_ROLES.OWNER },
      { login: 'edu-admin', password: 'edu123456', name: 'Edu Summit Admin', role: ORG_ROLES.ADMIN },
      { login: 'edu-operator', password: 'edu123456', name: 'Edu Summit Operator', role: ORG_ROLES.OPERATOR },
    ],
    events: [
      {
        title: 'Teachers Conference 2026',
        description: 'Pedagoglar uchun innovatsion usullar konferensiyasi.',
        location: 'National Library of Uzbekistan',
        daysFromNow: 2,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'STEM Day for Schools',
        description: 'Maktab o‘quvchilari uchun STEM festivallari.',
        location: 'Inha University Campus',
        daysFromNow: 16,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'University Admissions Fair',
        description: 'Oliy ta’lim muassasalari yarmarkasi.',
        location: 'Expo Center Tashkent',
        daysFromNow: -20,
        status: EVENT_STATUS.CLOSED,
      },
    ],
  },
  {
    name: 'MedExpo Uzbekistan',
    slug: 'medexpo-uz',
    members: [
      { login: 'med-owner', password: 'med123456', name: 'MedExpo Owner', role: ORG_ROLES.OWNER },
      { login: 'med-admin', password: 'med123456', name: 'MedExpo Admin', role: ORG_ROLES.ADMIN },
      { login: 'med-operator', password: 'med123456', name: 'MedExpo Operator', role: ORG_ROLES.OPERATOR },
    ],
    events: [
      {
        title: 'Healthcare Innovation Day',
        description: 'Tibbiy texnologiyalar va startaplar.',
        location: 'Hilton Tashkent City',
        daysFromNow: 1,
        hours: 9,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'Pharmacy Forum',
        description: 'Farmatsevtika bozori va regulatsiya.',
        location: 'International Hotel Tashkent',
        daysFromNow: 18,
        status: EVENT_STATUS.DRAFT,
      },
      {
        title: 'Nursing Skills Workshop',
        description: 'Hamshiralar malakasini oshirish workshopi.',
        location: 'Tashkent Medical Academy',
        daysFromNow: -8,
        status: EVENT_STATUS.CLOSED,
      },
    ],
  },
  {
    name: 'Sports Arena Live',
    slug: 'sports-arena',
    members: [
      { login: 'sports-owner', password: 'sports123456', name: 'Sports Arena Owner', role: ORG_ROLES.OWNER },
      { login: 'sports-admin', password: 'sports123456', name: 'Sports Arena Admin', role: ORG_ROLES.ADMIN },
      { login: 'sports-operator', password: 'sports123456', name: 'Sports Arena Operator', role: ORG_ROLES.OPERATOR },
    ],
    events: [
      {
        title: 'City Marathon Check-in',
        description: 'Marathon qatnashchilarini QR orqali ro‘yxatga olish.',
        location: 'Alisher Navoi Park',
        daysFromNow: 0,
        hours: 7,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'Youth Football Cup Final',
        description: 'Yoshlar futbol kubogi finali.',
        location: 'Bunyodkor Stadium',
        daysFromNow: 9,
        status: EVENT_STATUS.ACTIVE,
      },
      {
        title: 'Fitness Expo Weekend',
        description: 'Fitnes brendlari va trening shoulari.',
        location: 'Humo Arena',
        daysFromNow: -15,
        status: EVENT_STATUS.CLOSED,
      },
      {
        title: 'Esports LAN Party',
        description: 'CS2 va Dota 2 turnirlari.',
        location: 'Mega Planet Arena',
        daysFromNow: 28,
        status: EVENT_STATUS.DRAFT,
      },
    ],
  },
];

function daysFromNow(days: number, hours = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date;
}

async function ensureMembership(
  organizationId: Types.ObjectId,
  userId: Types.ObjectId,
  role: OrgRole,
): Promise<void> {
  const existing = await OrganizationUser.findOne({ userId });
  if (!existing) {
    await OrganizationUser.create({
      organizationId,
      userId,
      role,
      status: ORG_USER_STATUS.ACTIVE,
    });
    return;
  }

  existing.organizationId = organizationId;
  existing.role = role;
  existing.status = ORG_USER_STATUS.ACTIVE;
  await existing.save();
}

async function resetOrgData(organizationId: Types.ObjectId): Promise<void> {
  await Promise.all([
    Attendance.deleteMany({ organizationId }),
    ScanLog.deleteMany({ organizationId }),
    Participant.deleteMany({ organizationId }),
    Event.deleteMany({ organizationId }),
  ]);
}

async function seedOrgEvents(
  organizationId: Types.ObjectId,
  ownerId: Types.ObjectId,
  events: EventSpec[],
) {
  const created = [];

  for (const spec of events) {
    let event = await Event.findOne({ organizationId, title: spec.title });
    if (!event) {
      event = await Event.create({
        title: spec.title,
        description: spec.description,
        location: spec.location,
        eventDate: daysFromNow(spec.daysFromNow, spec.hours ?? 10),
        status: spec.status,
        organizationId,
        createdBy: ownerId,
      });
    }
    created.push(event);
  }

  return created;
}

async function seedOrgParticipants(
  organizationId: Types.ObjectId,
  eventId: Types.ObjectId,
  slug: string,
  count: number,
): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    const phone = `+99891${String(Math.abs(hashCode(`${slug}-${eventId}-${i}`)) % 10000000).padStart(7, '0')}`;
    const existing = await Participant.findOne({ organizationId, eventId, phone });
    if (existing) continue;

    await Participant.create({
      organizationId,
      eventId,
      name: `Guest ${slug.toUpperCase()} ${i + 1}`,
      phone,
      qrToken: generateQrToken(),
      isActive: true,
    });
  }
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function seedOneOrganization(spec: OrgSpec): Promise<void> {
  let subscription = await subscriptionService.getStarterPlan();
  if (!subscription) {
    subscription = await subscriptionService.create({
      name: 'Starter Plan',
      planCode: SUBSCRIPTION_PLAN_CODE.STARTER,
    });
  }

  let organization = await Organization.findOne({ slug: spec.slug });
  if (!organization) {
    organization = await Organization.create({
      name: spec.name,
      slug: spec.slug,
      subscriptionId: subscription._id,
    });
    console.log(`Organization created: ${spec.name}`);
  } else {
    organization.name = spec.name;
    organization.subscriptionId = subscription._id;
    await organization.save();
    console.log(`Organization exists: ${spec.name}`);
  }

  if (SHOULD_RESET) {
    await resetOrgData(organization._id);
    console.log(`  Reset mock data for ${spec.slug}`);
  }

  let ownerId: Types.ObjectId | null = null;

  for (const member of spec.members) {
    const result = await upsertSeedUser({
      name: member.name,
      login: member.login,
      password: member.password,
      isSuperAdmin: false,
    });
    await ensureMembership(organization._id, result.user._id, member.role);
    if (member.role === ORG_ROLES.OWNER) {
      ownerId = result.user._id;
    }
    console.log(`  ${member.role}: ${member.login} / ${member.password}`);
  }

  if (!ownerId) {
    throw new Error(`Owner missing for organization ${spec.slug}`);
  }

  const events = await seedOrgEvents(organization._id, ownerId, spec.events);
  for (const event of events) {
    await seedOrgParticipants(organization._id, event._id, spec.slug, PARTICIPANTS_PER_EVENT);
  }
  console.log(`  Events: ${events.length}, participants/event: ${PARTICIPANTS_PER_EVENT}`);
}

async function seed(): Promise<void> {
  await connectDB();

  try {
    console.log('--- Seeding base demo org + platform roles ---');
    await runSeed();

    console.log('\n--- Seeding extra organizations ---');
    for (const org of EXTRA_ORGS) {
      await seedOneOrganization(org);
      console.log('');
    }

    console.log('--- Done ---');
    console.log(`Total orgs (including demo-org): ${EXTRA_ORGS.length + 1}`);
  } finally {
    await disconnectDB();
  }
}

seed().catch((error) => {
  console.error('Organization seed failed:', error);
  process.exit(1);
});
