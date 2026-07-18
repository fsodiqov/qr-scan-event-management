import crypto from 'crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SPECIAL = '!@#$%^&*';

/** Generate a password that satisfies the app password policy. */
export function generateCompliantPassword(length = 16): string {
  const required = [
    UPPER[crypto.randomInt(UPPER.length)],
    LOWER[crypto.randomInt(LOWER.length)],
    DIGITS[crypto.randomInt(DIGITS.length)],
    SPECIAL[crypto.randomInt(SPECIAL.length)],
  ];

  const all = UPPER + LOWER + DIGITS + SPECIAL;
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () =>
    all[crypto.randomInt(all.length)],
  );

  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
