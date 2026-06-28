import { connectDB, disconnectDB } from '../config/db';

const LEGACY_LOGIN_MAP: Record<string, string> = {
  'superadmin@example.com': 'superadmin',
  'owner@example.com': 'owner',
};

async function migrate(): Promise<void> {
  await connectDB();

  const db = (await import('mongoose')).default.connection.db;
  if (!db) {
    throw new Error('Database connection is not ready');
  }

  const users = db.collection('users');
  const withEmail = await users.countDocuments({ email: { $exists: true } });

  if (withEmail > 0) {
    await users.updateMany({ email: { $exists: true } }, { $rename: { email: 'login' } });
    console.log(`Renamed email → login for ${withEmail} user(s)`);
  } else {
    console.log('No users with email field — rename step skipped');
  }

  let normalized = 0;
  for (const [legacyLogin, newLogin] of Object.entries(LEGACY_LOGIN_MAP)) {
    const result = await users.updateOne(
      { login: legacyLogin },
      { $set: { login: newLogin } },
    );
    if (result.modifiedCount > 0) {
      normalized += result.modifiedCount;
      console.log(`Normalized login: ${legacyLogin} → ${newLogin}`);
    }
  }

  const emailFormatUsers = await users
    .find({ login: { $regex: '@' } })
    .project({ login: 1 })
    .toArray();

  for (const doc of emailFormatUsers) {
    const login = doc.login as string;
    if (LEGACY_LOGIN_MAP[login]) {
      continue;
    }

    const localPart = login.split('@')[0]?.trim();
    if (!localPart) {
      continue;
    }

    const conflict = await users.findOne({ login: localPart, _id: { $ne: doc._id } });
    if (conflict) {
      console.log(`Skipped ${login}: target login "${localPart}" already exists`);
      continue;
    }

    await users.updateOne({ _id: doc._id }, { $set: { login: localPart } });
    normalized += 1;
    console.log(`Normalized login: ${login} → ${localPart}`);
  }

  if (normalized === 0) {
    console.log('No email-format logins to normalize');
  } else {
    console.log(`Normalized ${normalized} login value(s)`);
  }

  await disconnectDB();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
