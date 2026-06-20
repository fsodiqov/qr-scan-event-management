import { connectDB, disconnectDB } from '../config/db';
import { authService } from '../services/auth.service';
import { ROLES } from '../constants/roles';

async function seed(): Promise<void> {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'System Admin';

  try {
    const admin = await authService.createAdmin({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
    });

    console.log('Seed admin created:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: ${ROLES.ADMIN}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Seed admin already exists, skipping.');
    } else {
      throw error;
    }
  }

  await disconnectDB();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
