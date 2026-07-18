import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { subscriptionService } from '../services/subscription.service';
import { ORG_ROLES } from '../constants/roles';
import { EVENT_STATUS, EventStatus } from '../constants/eventStatus';
import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
  SCAN_RESULT,
  ScanResult,
} from '../constants/attendanceStatus';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { SUBSCRIPTION_PLAN_CODE } from '../constants/subscriptionStatus';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { Event, IEvent } from '../models/Event';
import { Participant, IParticipant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { generateQrToken } from '../utils/qrToken';
import { upsertSeedUser } from './seedUserUtils';

const SHOULD_RESET = process.env.SEED_RESET === 'true';

const OWNER_LOGIN = process.env.SEED_OWNER_LOGIN ?? process.env.SEED_OWNER_EMAIL ?? 'owner';
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? 'Owner123456!';
const OWNER_NAME = process.env.SEED_OWNER_NAME ?? 'Organization Owner';
const ORG_NAME = process.env.SEED_ORG_NAME ?? 'Demo Organization';
const ORG_SLUG = process.env.SEED_ORG_SLUG ?? 'demo-org';

const PARTICIPANT_COUNT = 40;

const FIRST_NAMES = [
  'Aziza', 'Jasur', 'Dilnoza', 'Sardor', 'Madina', 'Bekzod', 'Nilufar', 'Rustam',
  'Kamola', 'Otabek', 'Shahzoda', 'Farruh', 'Gulnora', 'Timur', 'Sevinch', 'Alisher',
  'Nigora', 'Bobur', 'Maftuna', 'Sherzod', 'Laylo', 'Javohir', 'Mohira', 'Ulugbek',
  'Diyora', 'Sunnat', 'Zarina', 'Anvar', 'Feruza', 'Islom', 'Munisa', 'Jahongir',
  'Charos', 'Siroj', 'Malika', 'Husan', 'Nodira', 'Sanjar', 'Yulduz', 'Mirzo',
];

const LAST_NAMES = [
  'Karimova', 'Rahimov', 'Yusupova', 'Aliyev', 'Toshmatova', 'Nurmatov', 'Ismoilova',
  'Gafurov', 'Ergasheva', 'Mirzayev', 'Qodirova', 'Sattorov', 'Xolmatova', 'Umarov',
  'Raxmonova', 'Tursunov', 'Normatova', 'Haydarov', 'Saidova', 'Mamatov', 'Eshonova',
  'Boltayev', 'Ruziyeva', 'Pulatov', 'Axmedova', 'Jo\'rayev', 'Baxtiyorova', 'Musayev',
  'Sharipova', 'Qosimov', 'Yuldasheva', 'Abdullayev', 'Sodiqova', 'Rasulov', 'Meliqova',
  'Toshov', 'Nazarova', 'Hamidov', 'Qurbanova', 'Ergashev',
];

function buildParticipantData() {
  return Array.from({ length: PARTICIPANT_COUNT }, (_, index) => {
    return {
      name: `${FIRST_NAMES[index]} ${LAST_NAMES[index]}`,
      phone: `+99890${String(1110000 + index).slice(-7)}`,
    };
  });
}

async function ensureOrganizationAndOwner() {
  let subscription = await subscriptionService.getStarterPlan();
  if (!subscription) {
    subscription = await subscriptionService.create({
      name: 'Starter Plan',
      planCode: SUBSCRIPTION_PLAN_CODE.STARTER,
    });
  }

  let organization = await Organization.findOne({ slug: ORG_SLUG });
  if (!organization) {
    organization = await Organization.create({
      name: ORG_NAME,
      slug: ORG_SLUG,
      subscriptionId: subscription._id,
    });
  }

  const ownerResult = await upsertSeedUser({
    name: OWNER_NAME,
    login: OWNER_LOGIN,
    password: OWNER_PASSWORD,
    isSuperAdmin: false,
  });
  const owner = ownerResult.user;

  const membership = await OrganizationUser.findOne({ userId: owner._id });
  if (!membership) {
    await OrganizationUser.create({
      organizationId: organization._id,
      userId: owner._id,
      role: ORG_ROLES.OWNER,
      status: ORG_USER_STATUS.ACTIVE,
    });
  }

  return { organization, owner };
}

async function seedParticipants(
  organizationId: Types.ObjectId,
  eventId: Types.ObjectId,
): Promise<IParticipant[]> {
  const data = buildParticipantData();
  const created: IParticipant[] = [];

  for (const item of data) {
    const existing = await Participant.findOne({
      organizationId,
      eventId,
      phone: item.phone,
    });

    if (existing) {
      created.push(existing);
      continue;
    }

    const participant = await Participant.create({
      organizationId,
      eventId,
      name: item.name,
      phone: item.phone,
      qrToken: generateQrToken(),
      isActive: true,
    });

    created.push(participant);
  }

  console.log(`Participants ready: ${created.length}`);
  return created;
}

function daysFromNow(days: number, hours = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date;
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

async function seedEvents(
  organizationId: Types.ObjectId,
  ownerId: Types.ObjectId,
): Promise<IEvent[]> {
  const eventsData: Array<{
    title: string;
    description: string;
    location: string;
    eventDate: Date;
    status: EventStatus;
  }> = [
    {
      title: 'Yillik IT Konferensiyasi 2026',
      description: 'Mahalliy va xalqaro IT mutaxassislari uchun yillik konferensiya.',
      location: 'Tashkent City Congress Hall',
      eventDate: daysFromNow(0, 9),
      status: EVENT_STATUS.ACTIVE,
    },
    {
      title: 'Startup Demo Day',
      description: 'Yosh tadbirkorlar uchun demo kun va investor uchrashuvi.',
      location: 'IT Park Tashkent',
      eventDate: daysFromNow(7, 14),
      status: EVENT_STATUS.ACTIVE,
    },
    {
      title: 'Cyber Security Summit',
      description: 'Axborot xavfsizligi va ma\'lumotlarni himoya qilish bo\'yicha summit.',
      location: 'Hyatt Regency Tashkent',
      eventDate: daysFromNow(3, 10),
      status: EVENT_STATUS.ACTIVE,
    },
    {
      title: 'HR va Kadrlar Forumi',
      description: 'Kadrlar boshqaruvi va korporativ madaniyat mavzulari.',
      location: 'International Hotel Tashkent',
      eventDate: daysFromNow(-14, 11),
      status: EVENT_STATUS.CLOSED,
    },
    {
      title: 'E-commerce Growth Meetup',
      description: 'Onlayn savdo va logistika bo\'yicha amaliy uchrashuv.',
      location: 'WOW Tashkent',
      eventDate: daysFromNow(-7, 15),
      status: EVENT_STATUS.CLOSED,
    },
    {
      title: 'Digital Marketing Bootcamp',
      description: 'SMM, performance marketing va kontent strategiyasi.',
      location: 'Westminster Hall',
      eventDate: daysFromNow(-21, 10),
      status: EVENT_STATUS.CLOSED,
    },
    {
      title: 'Fintech Workshop',
      description: 'To\'lov tizimlari va moliyaviy texnologiyalar bo\'yicha workshop.',
      location: 'INHA University Tashkent',
      eventDate: daysFromNow(21, 10),
      status: EVENT_STATUS.DRAFT,
    },
    {
      title: 'AI va Machine Learning Forum',
      description: 'Sun\'iy intellekt loyihalari va amaliy qo\'llanilishi.',
      location: 'Turin Polytechnic University',
      eventDate: daysFromNow(30, 11),
      status: EVENT_STATUS.DRAFT,
    },
  ];

  const events: IEvent[] = [];

  for (const data of eventsData) {
    let event = await Event.findOne({ title: data.title, organizationId });

    if (!event) {
      event = await Event.create({
        ...data,
        organizationId,
        createdBy: ownerId,
      });
    }

    events.push(event);
  }

  console.log(`Events ready: ${events.length}`);
  return events;
}

function pickIndices(total: number, count: number, offset = 0): number[] {
  const indices: number[] = [];
  for (let i = 0; i < count; i += 1) {
    indices.push((offset + i) % total);
  }
  return indices;
}

async function upsertAttendance(
  participantId: Types.ObjectId,
  eventId: Types.ObjectId,
  organizationId: Types.ObjectId,
  status: AttendanceStatus,
  checkInTime: Date,
  checkOutTime?: Date,
): Promise<void> {
  await Attendance.findOneAndUpdate(
    { participantId, eventId },
    { participantId, eventId, organizationId, status, checkInTime, checkOutTime },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedAttendanceForEvent(
  participants: IParticipant[],
  event: IEvent,
  organizationId: Types.ObjectId,
  config: {
    checkedIn: number;
    checkedOut: number;
    checkedOutOffset?: number;
  },
): Promise<number> {
  let count = 0;
  const total = participants.length;

  for (const index of pickIndices(total, config.checkedIn)) {
    await upsertAttendance(
      participants[index]._id,
      event._id,
      organizationId,
      ATTENDANCE_STATUS.CHECKED_IN,
      hoursAgo(0.5 + (index % 6) * 0.4),
    );
    count += 1;
  }

  for (const index of pickIndices(total, config.checkedOut, config.checkedOutOffset ?? 0)) {
    await upsertAttendance(
      participants[index]._id,
      event._id,
      organizationId,
      ATTENDANCE_STATUS.CHECKED_OUT,
      hoursAgo(4 + (index % 5)),
      hoursAgo(0.3 + (index % 4) * 0.2),
    );
    count += 1;
  }

  return count;
}

async function seedAllAttendance(
  participantsByEvent: Map<string, IParticipant[]>,
  events: IEvent[],
  organizationId: Types.ObjectId,
): Promise<number> {
  let count = 0;
  const todayEvent = events.find((e) => e.title === 'Yillik IT Konferensiyasi 2026');
  const demoDay = events.find((e) => e.title === 'Startup Demo Day');
  const securitySummit = events.find((e) => e.title === 'Cyber Security Summit');
  const closedEvents = events.filter((e) => e.status === EVENT_STATUS.CLOSED);

  if (todayEvent) {
    const participants = participantsByEvent.get(todayEvent._id.toString()) ?? [];
    count += await seedAttendanceForEvent(participants, todayEvent, organizationId, {
      checkedIn: 22,
      checkedOut: 12,
      checkedOutOffset: 22,
    });
  }

  if (demoDay) {
    const participants = participantsByEvent.get(demoDay._id.toString()) ?? [];
    for (const index of pickIndices(participants.length, 8, 5)) {
      await upsertAttendance(
        participants[index]._id,
        demoDay._id,
        organizationId,
        ATTENDANCE_STATUS.CHECKED_IN,
        hoursAgo(0.2 + index * 0.05),
      );
      count += 1;
    }
  }

  if (securitySummit) {
    const participants = participantsByEvent.get(securitySummit._id.toString()) ?? [];
    for (const index of pickIndices(participants.length, 6, 12)) {
      await upsertAttendance(
        participants[index]._id,
        securitySummit._id,
        organizationId,
        ATTENDANCE_STATUS.CHECKED_IN,
        hoursAgo(1 + index * 0.1),
      );
      count += 1;
    }
  }

  for (const closedEvent of closedEvents) {
    const participants = participantsByEvent.get(closedEvent._id.toString()) ?? [];
    const participantCount = closedEvent.title === 'Digital Marketing Bootcamp' ? 28 : 20;
    for (const index of pickIndices(participants.length, participantCount, closedEvents.indexOf(closedEvent) * 3)) {
      await upsertAttendance(
        participants[index]._id,
        closedEvent._id,
        organizationId,
        ATTENDANCE_STATUS.CHECKED_OUT,
        hoursAgo(24 * 10 + index),
        hoursAgo(24 * 9 + index * 0.5),
      );
      count += 1;
    }
  }

  console.log(`Attendance records ready: ${count}`);
  return count;
}

async function createScanLog(
  adminId: Types.ObjectId,
  organizationId: Types.ObjectId,
  eventId: Types.ObjectId,
  result: ScanResult,
  scannedAt: Date,
  participantId?: Types.ObjectId,
): Promise<boolean> {
  const exists = await ScanLog.findOne({
    eventId,
    result,
    scannedAt,
    participantId: participantId ?? null,
  });

  if (exists) return false;

  await ScanLog.create({
    participantId,
    eventId,
    organizationId,
    scannedBy: adminId,
    result,
    scannedAt,
    metadata: { source: 'seed' },
  });

  return true;
}

async function seedScanLogs(
  participantsByEvent: Map<string, IParticipant[]>,
  events: IEvent[],
  organizationId: Types.ObjectId,
  adminId: Types.ObjectId,
): Promise<number> {
  const todayEvent = events.find((e) => e.title === 'Yillik IT Konferensiyasi 2026');
  const demoDay = events.find((e) => e.title === 'Startup Demo Day');
  const securitySummit = events.find((e) => e.title === 'Cyber Security Summit');

  let count = 0;

  if (todayEvent) {
    const participants = participantsByEvent.get(todayEvent._id.toString()) ?? [];
    for (let i = 0; i < 34; i += 1) {
      const participant = participants[i % participants.length];
      const checkInAt = minutesAgo(180 - i * 4);

      if (await createScanLog(adminId, organizationId, todayEvent._id, SCAN_RESULT.CHECK_IN, checkInAt, participant?._id)) {
        count += 1;
      }

      if (i % 3 === 0 && participant) {
        const checkOutAt = minutesAgo(90 - i * 2);
        if (await createScanLog(adminId, organizationId, todayEvent._id, SCAN_RESULT.CHECK_OUT, checkOutAt, participant._id)) {
          count += 1;
        }
      }
    }

    for (let i = 0; i < 4; i += 1) {
      if (await createScanLog(adminId, organizationId, todayEvent._id, SCAN_RESULT.INVALID, minutesAgo(20 - i * 3))) {
        count += 1;
      }
    }

    for (let i = 0; i < 3; i += 1) {
      const participant = participants[(i + 30) % participants.length];
      if (participant && await createScanLog(adminId, organizationId, todayEvent._id, SCAN_RESULT.ALREADY_OUT, minutesAgo(15 - i * 4), participant._id)) {
        count += 1;
      }
    }
  }

  if (demoDay) {
    const participants = participantsByEvent.get(demoDay._id.toString()) ?? [];
    for (let i = 0; i < 10; i += 1) {
      const participant = participants[(i + 8) % participants.length];
      if (participant && await createScanLog(adminId, organizationId, demoDay._id, SCAN_RESULT.CHECK_IN, minutesAgo(60 - i * 5), participant._id)) {
        count += 1;
      }
    }
  }

  if (securitySummit) {
    const participants = participantsByEvent.get(securitySummit._id.toString()) ?? [];
    for (let i = 0; i < 8; i += 1) {
      const participant = participants[(i + 15) % participants.length];
      if (participant && await createScanLog(adminId, organizationId, securitySummit._id, SCAN_RESULT.CHECK_IN, minutesAgo(120 - i * 8), participant._id)) {
        count += 1;
      }
    }
  }

  console.log(`Scan logs created: ${count}`);
  return count;
}

async function resetCollections(organizationId: Types.ObjectId): Promise<void> {
  await Promise.all([
    Attendance.deleteMany({}),
    ScanLog.deleteMany({}),
    Participant.deleteMany({ organizationId }),
    Event.deleteMany({ organizationId }),
  ]);

  // Drop legacy MVP indexes (userId-based) if they still exist
  try {
    await Attendance.collection.dropIndex('userId_1_eventId_1');
  } catch {
    // Index may not exist
  }
  try {
    await ScanLog.collection.dropIndex('userId_1_scannedAt_-1');
  } catch {
    // Index may not exist
  }

  await Attendance.syncIndexes();
  await ScanLog.syncIndexes();
  await Participant.syncIndexes();
  await Event.syncIndexes();

  console.log('Mock collections cleared for organization');
}

async function seed(): Promise<void> {
  await connectDB();

  const { organization, owner } = await ensureOrganizationAndOwner();

  if (SHOULD_RESET) {
    await resetCollections(organization._id);
  }

  const events = await seedEvents(organization._id, owner._id);

  const participantsByEvent = new Map<string, IParticipant[]>();
  for (const event of events) {
    const participants = await seedParticipants(organization._id, event._id);
    participantsByEvent.set(event._id.toString(), participants);
  }

  await seedAllAttendance(participantsByEvent, events, organization._id);
  await seedScanLogs(participantsByEvent, events, organization._id, owner._id);

  console.log('\n--- Mock seed summary ---');
  console.log(`Owner login: ${OWNER_LOGIN} / ${OWNER_PASSWORD}`);
  console.log(`Organization: ${ORG_NAME}`);
  console.log(`Events: ${events.length}`);
  console.log(`Participants per event: ${PARTICIPANT_COUNT}`);

  await disconnectDB();
}

seed().catch((error) => {
  console.error('Mock seed failed:', error);
  process.exit(1);
});
