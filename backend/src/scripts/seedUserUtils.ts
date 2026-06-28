import { User, IUser } from '../models/User';

export function legacyLoginCandidates(login: string): string[] {
  const trimmed = login.trim();
  const candidates = new Set<string>([trimmed]);

  if (!trimmed.includes('@')) {
    candidates.add(`${trimmed}@example.com`);
  }

  return [...candidates];
}

export async function findUserByLoginCandidates(
  login: string,
): Promise<IUser | null> {
  return User.findOne({ login: { $in: legacyLoginCandidates(login) } });
}

export async function upsertSeedUser(data: {
  name: string;
  login: string;
  password: string;
  isSuperAdmin?: boolean;
}): Promise<{ user: IUser; created: boolean }> {
  const normalizedLogin = data.login.trim();
  let user = await findUserByLoginCandidates(normalizedLogin);

  if (user) {
    user.name = data.name;
    user.login = normalizedLogin;
    user.passwordHash = data.password;
    user.isActive = true;
    if (data.isSuperAdmin !== undefined) {
      user.isSuperAdmin = data.isSuperAdmin;
    }
    await user.save();
    return { user, created: false };
  }

  user = new User({
    name: data.name,
    login: normalizedLogin,
    passwordHash: data.password,
    isActive: true,
    isSuperAdmin: data.isSuperAdmin ?? false,
  });
  await user.save();
  return { user, created: true };
}
