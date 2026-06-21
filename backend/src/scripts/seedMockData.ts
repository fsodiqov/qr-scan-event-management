import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { authService } from '../services/auth.service';
import { ROLES } from '../constants/roles';
import { EVENT_STATUS, EventStatus } from '../constants/eventStatus';
import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
  SCAN_RESULT,
  ScanResult,
} from '../constants/attendanceStatus';
import { User, IUser } from '../models/User';
import { Event, IEvent } from '../models/Event';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';

const SHOULD_RESET = process.env.SEED_RESET === 'true';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'System Admin';
const PARTICIPANT_PASSWORD = process.env.SEED_PARTICIPANT_PASSWORD ?? 'participant123';

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

const ORGANIZATIONS = [
  'Toshkent Davlat Universiteti',
  'IT Park Uzbekistan',
  'Mediapark',
  'Uzum Market',
  'Artel Electronics',
  'Payme',
  'Humans',
  'Beeline Uzbekistan',
  'TBC Bank',
  'Aloqabank',
  'Click',
  'Kapitalbank',
  'Ucell',
  'MyTaxi',
  'Korzinka',
  'BI Group',
  'EPAM Uzbekistan',
  'Exadel',
  'Ministry of Digital Technologies',
  'Westminster International University',
];

function buildParticipants() {
  return Array.from({ length: PARTICIPANT_COUNT }, (_, index) => {
    const suffix = String(index + 1).padStart(2, '0');
    return {
      name: `${FIRST_NAMES[index]} ${LAST_NAMES[index]}`,
      phone: `+99890${String(1110000 + index).slice(-7)}`,
      organization: ORGANIZATIONS[index % ORGANIZATIONS.length],
    };
  });
}

async function ensureAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL, role: ROLES.ADMIN });

  if (!admin) {
    admin = await authService.createAdmin({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('Admin created');
  } else {
    console.log('Admin already exists, skipping');
  }

  return admin;
}

async function seedParticipants(): Promise<IUser[]> {
  const participants = buildParticipants();
  const created: IUser[] = [];

  for (const data of participants) {
    const existing = await User.findOne({ phone: data.phone });

    if (existing) {
      created.push(existing);
      continue;
    }

    const user = new User({
      name: data.name,
      phone: data.phone,
      organization: data.organization,
      role: ROLES.PARTICIPANT,
      passwordHash: PARTICIPANT_PASSWORD,
      isActive: true,
    });

    await user.save();
    created.push(user);
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

async function seedEvents(adminId: Types.ObjectId): Promise<IEvent[]> {
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
    let event = await Event.findOne({ title: data.title });

    if (!event) {
      event = await Event.create({
        ...data,
        createdBy: adminId,
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
  userId: Types.ObjectId,
  eventId: Types.ObjectId,
  status: AttendanceStatus,
  checkInTime: Date,
  checkOutTime?: Date,
): Promise<void> {
  await Attendance.findOneAndUpdate(
    { userId, eventId },
    { userId, eventId, status, checkInTime, checkOutTime },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedAttendance(
  participants: IUser[],
  events: IEvent[],
): Promise<number> {
  const todayEvent = events.find((e) => e.title === 'Yillik IT Konferensiyasi 2026');
  const demoDay = events.find((e) => e.title === 'Startup Demo Day');
  const securitySummit = events.find((e) => e.title === 'Cyber Security Summit');
  const closedEvents = events.filter((e) => e.status === EVENT_STATUS.CLOSED);

  let count = 0;
  const total = participants.length;

  if (todayEvent) {
    const checkedInIndices = pickIndices(total, 22);
    const checkedOutIndices = pickIndices(total, 12, 22);

    for (const index of checkedInIndices) {
      await upsertAttendance(
        participants[index]._id,
        todayEvent._id,
        ATTENDANCE_STATUS.CHECKED_IN,
        hoursAgo(0.5 + (index % 6) * 0.4),
      );
      count += 1;
    }

    for (const index of checkedOutIndices) {
      await upsertAttendance(
        participants[index]._id,
        todayEvent._id,
        ATTENDANCE_STATUS.CHECKED_OUT,
        hoursAgo(4 + (index % 5)),
        hoursAgo(0.3 + (index % 4) * 0.2),
      );
      count += 1;
    }
  }

  if (demoDay) {
    for (const index of pickIndices(total, 8, 5)) {
      await upsertAttendance(
        participants[index]._id,
        demoDay._id,
        ATTENDANCE_STATUS.CHECKED_IN,
        hoursAgo(0.2 + index * 0.05),
      );
      count += 1;
    }
  }

  if (securitySummit) {
    for (const index of pickIndices(total, 6, 12)) {
      await upsertAttendance(
        participants[index]._id,
        securitySummit._id,
        ATTENDANCE_STATUS.CHECKED_IN,
        hoursAgo(1 + index * 0.1),
      );
      count += 1;
    }
  }

  for (const closedEvent of closedEvents) {
    const participantCount = closedEvent.title === 'Digital Marketing Bootcamp' ? 28 : 20;
    for (const index of pickIndices(total, participantCount, closedEvents.indexOf(closedEvent) * 3)) {
      await upsertAttendance(
        participants[index]._id,
        closedEvent._id,
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
  eventId: Types.ObjectId,
  result: ScanResult,
  scannedAt: Date,
  userId?: Types.ObjectId,
): Promise<boolean> {
  const exists = await ScanLog.findOne({
    eventId,
    result,
    scannedAt,
    userId: userId ?? null,
  });

  if (exists) return false;

  await ScanLog.create({
    userId,
    eventId,
    scannedBy: adminId,
    result,
    scannedAt,
    metadata: { source: 'seed' },
  });

  return true;
}

async function seedScanLogs(
  participants: IUser[],
  events: IEvent[],
  adminId: Types.ObjectId,
): Promise<number> {
  const todayEvent = events.find((e) => e.title === 'Yillik IT Konferensiyasi 2026');
  const demoDay = events.find((e) => e.title === 'Startup Demo Day');
  const securitySummit = events.find((e) => e.title === 'Cyber Security Summit');

  let count = 0;

  if (todayEvent) {
    for (let i = 0; i < 34; i += 1) {
      const user = participants[i % participants.length];
      const checkInAt = minutesAgo(180 - i * 4);

      if (await createScanLog(adminId, todayEvent._id, SCAN_RESULT.CHECK_IN, checkInAt, user._id)) {
        count += 1;
      }

      if (i % 3 === 0) {
        const checkOutAt = minutesAgo(90 - i * 2);
        if (await createScanLog(adminId, todayEvent._id, SCAN_RESULT.CHECK_OUT, checkOutAt, user._id)) {
          count += 1;
        }
      }
    }

    for (let i = 0; i < 4; i += 1) {
      if (await createScanLog(adminId, todayEvent._id, SCAN_RESULT.INVALID, minutesAgo(20 - i * 3))) {
        count += 1;
      }
    }

    for (let i = 0; i < 3; i += 1) {
      const user = participants[(i + 30) % participants.length];
      if (await createScanLog(adminId, todayEvent._id, SCAN_RESULT.ALREADY_OUT, minutesAgo(15 - i * 4), user._id)) {
        count += 1;
      }
    }
  }

  if (demoDay) {
    for (let i = 0; i < 10; i += 1) {
      const user = participants[(i + 8) % participants.length];
      if (await createScanLog(adminId, demoDay._id, SCAN_RESULT.CHECK_IN, minutesAgo(60 - i * 5), user._id)) {
        count += 1;
      }
    }
  }

  if (securitySummit) {
    for (let i = 0; i < 8; i += 1) {
      const user = participants[(i + 15) % participants.length];
      if (await createScanLog(adminId, securitySummit._id, SCAN_RESULT.CHECK_IN, minutesAgo(120 - i * 8), user._id)) {
        count += 1;
      }
    }
  }

  console.log(`Scan logs created: ${count}`);
  return count;
}

async function resetCollections(): Promise<void> {
  await Promise.all([
    Attendance.deleteMany({}),
    ScanLog.deleteMany({}),
    Event.deleteMany({}),
    User.deleteMany({ role: ROLES.PARTICIPANT }),
  ]);
  console.log('Mock collections cleared (participants, events, attendance, scan logs)');
}

async function seed(): Promise<void> {
  await connectDB();

  if (SHOULD_RESET) {
    await resetCollections();
  }

  const admin = await ensureAdmin();
  const participants = await seedParticipants();
  const events = await seedEvents(admin._id);
  await seedAttendance(participants, events);
  await seedScanLogs(participants, events, admin._id);

  console.log('\n--- Seed summary ---');
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Participant password (all): ${PARTICIPANT_PASSWORD}`);
  console.log(`Participants: ${participants.length}`);
  console.log(`Events: ${events.length}`);
  console.log('Dashboard expects ~40 participants, ~50+ attendance rows, ~60+ scan logs');

  await disconnectDB();
}

seed().catch((error) => {
  console.error('Mock seed failed:', error);
  process.exit(1);
});
