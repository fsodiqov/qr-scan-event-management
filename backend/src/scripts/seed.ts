import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { subscriptionService } from '../services/subscription.service';
import { Organization } from '../models/Organization';
import { OrganizationUser } from '../models/OrganizationUser';
import { ORG_ROLES, OrgRole } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { SUBSCRIPTION_PLAN_CODE } from '../constants/subscriptionStatus';
import { findUserByLoginCandidates, upsertSeedUser } from './seedUserUtils';

async function ensureOrgMembership(params: {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrgRole;
  label: string;
}): Promise<void> {
  const existing = await OrganizationUser.findOne({ userId: params.userId });
  if (!existing) {
    await OrganizationUser.create({
      organizationId: params.organizationId,
      userId: params.userId,
      role: params.role,
      status: ORG_USER_STATUS.ACTIVE,
    });
    console.log(`${params.label} membership created`);
    return;
  }

  existing.organizationId = params.organizationId;
  existing.role = params.role;
  existing.status = ORG_USER_STATUS.ACTIVE;
  await existing.save();
  console.log(`${params.label} membership already exists (synced)`);
}

export async function runSeed(): Promise<void> {
  const superAdminLogin = process.env.SEED_SUPER_ADMIN_LOGIN ?? process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Superadmin123!';
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Platform Super Admin';

  const ownerLogin = process.env.SEED_OWNER_LOGIN ?? process.env.SEED_OWNER_EMAIL ?? 'owner';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'Owner123456!';
  const ownerName = process.env.SEED_OWNER_NAME ?? 'Organization Owner';

  const adminLogin = process.env.SEED_ADMIN_LOGIN ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123456!';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Organization Admin';

  const operatorLogin = process.env.SEED_OPERATOR_LOGIN ?? 'operator';
  const operatorPassword = process.env.SEED_OPERATOR_PASSWORD ?? 'Operator123!';
  const operatorName = process.env.SEED_OPERATOR_NAME ?? 'Organization Operator';

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

  const orgMembers: Array<{
    label: string;
    name: string;
    login: string;
    password: string;
    role: OrgRole;
  }> = [
    {
      label: 'Organization owner',
      name: ownerName,
      login: ownerLogin,
      password: ownerPassword,
      role: ORG_ROLES.OWNER,
    },
    {
      label: 'Organization admin',
      name: adminName,
      login: adminLogin,
      password: adminPassword,
      role: ORG_ROLES.ADMIN,
    },
    {
      label: 'Organization operator',
      name: operatorName,
      login: operatorLogin,
      password: operatorPassword,
      role: ORG_ROLES.OPERATOR,
    },
  ];

  for (const member of orgMembers) {
    const result = await upsertSeedUser({
      name: member.name,
      login: member.login,
      password: member.password,
      isSuperAdmin: false,
    });
    console.log(
      result.created ? `${member.label} user created` : `${member.label} user updated`,
    );
    await ensureOrgMembership({
      organizationId: organization._id,
      userId: result.user._id,
      role: member.role,
      label: member.label,
    });
  }

  console.log('\n--- Seed credentials ---');
  console.log(`Super Admin: ${superAdminLogin} / ${superAdminPassword}`);
  console.log(`Org Owner:   ${ownerLogin} / ${ownerPassword}`);
  console.log(`Org Admin:   ${adminLogin} / ${adminPassword}`);
  console.log(`Operator:    ${operatorLogin} / ${operatorPassword}`);
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
