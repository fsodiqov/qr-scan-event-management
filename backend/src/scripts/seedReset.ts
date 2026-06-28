import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { Event } from '../models/Event';
import { Participant } from '../models/Participant';
import { Attendance } from '../models/Attendance';
import { ScanLog } from '../models/ScanLog';
import { runSeed } from './seed';

async function resetAndSeed(): Promise<void> {
  await connectDB();

  try {
    const [attendanceResult, scanLogResult, participantResult, eventResult, orgUserResult, userResult, orgResult] =
      await Promise.all([
        Attendance.deleteMany({}),
        ScanLog.deleteMany({}),
        Participant.deleteMany({}),
        Event.deleteMany({}),
        OrganizationUser.deleteMany({}),
        User.deleteMany({}),
        Organization.deleteMany({}),
      ]);

    console.log('Database reset complete:');
    console.log(`  Attendance removed: ${attendanceResult.deletedCount}`);
    console.log(`  Scan logs removed: ${scanLogResult.deletedCount}`);
    console.log(`  Participants removed: ${participantResult.deletedCount}`);
    console.log(`  Events removed: ${eventResult.deletedCount}`);
    console.log(`  Organization users removed: ${orgUserResult.deletedCount}`);
    console.log(`  Users removed: ${userResult.deletedCount}`);
    console.log(`  Organizations removed: ${orgResult.deletedCount}`);
    console.log('');

    await runSeed();
  } finally {
    await disconnectDB();
  }
}

resetAndSeed().catch((error) => {
  console.error('Seed reset failed:', error);
  process.exit(1);
});
