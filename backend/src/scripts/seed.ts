import { connectDB, disconnectDB } from '../config/db';
import { subscriptionService } from '../services/subscription.service';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { SUBSCRIPTION_PLAN_CODE } from '../constants/subscriptionStatus';
import { findUserByLoginCandidates, upsertSeedUser } from './seedUserUtils';

export async function runSeed(): Promise<void> {
  const superAdminLogin = process.env.SEED_SUPER_ADMIN_LOGIN ?? process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'superadmin123456';
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Platform Super Admin';

  const ownerLogin = process.env.SEED_OWNER_LOGIN ?? process.env.SEED_OWNER_EMAIL ?? 'owner';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'owner123456';
  const ownerName = process.env.SEED_OWNER_NAME ?? 'Organization Owner';

  const orgName = process.env.SEED_ORG_NAME ?? 'Demo Organization';
  const orgSlug = process.env.SEED_ORG_SLUG ?? 'demo-org';

  let subscription = await subscriptionService.getStarterPlan();
  if (!subscription) {
    subscription = await subscriptionService.create({
      name: 'Starter Plan',
      planCode: SUBSCRIPTION_PLAN_CODE.STARTER,
    });
    console.log('Starter subscription plan created');
  } else {
    console.log('Starter subscription plan already exists');
  }

  const superAdminResult = await upsertSeedUser({
    name: superAdminName,
    login: superAdminLogin,
    password: superAdminPassword,
    isSuperAdmin: true,
  });
  console.log(
    superAdminResult.created ? 'Super admin created' : 'Super admin updated',
  );
  console.log(`  Login: ${superAdminLogin}`);
  console.log(`  Password: ${superAdminPassword}`);

  let organization = await Organization.findOne({ slug: orgSlug });
  if (!organization) {
    organization = await Organization.create({
      name: orgName,
      slug: orgSlug,
      subscriptionId: subscription._id,
    });
    console.log(`Organization created: ${orgName}`);
  } else {
    console.log('Organization already exists, skipping');
  }

  const ownerResult = await upsertSeedUser({
    name: ownerName,
    login: ownerLogin,
    password: ownerPassword,
    isSuperAdmin: false,
  });
  const owner = ownerResult.user;
  console.log(
    ownerResult.created ? 'Organization owner user created' : 'Organization owner user updated',
  );

  const existingMembership = await OrganizationUser.findOne({ userId: owner._id });
  if (!existingMembership) {
    await OrganizationUser.create({
      organizationId: organization._id,
      userId: owner._id,
      role: ORG_ROLES.OWNER,
      status: ORG_USER_STATUS.ACTIVE,
    });
    console.log('Organization owner membership created');
  } else {
    console.log('Organization owner membership already exists');
  }

  console.log('\n--- Seed credentials ---');
  console.log(`Super Admin: ${superAdminLogin} / ${superAdminPassword}`);
  console.log(`Org Owner:   ${ownerLogin} / ${ownerPassword}`);
  console.log(`Organization: ${orgName} (${orgSlug})`);
}

async function seed(): Promise<void> {
  await connectDB();

  try {
    await runSeed();
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}

export { findUserByLoginCandidates };
