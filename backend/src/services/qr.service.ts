import { IUser } from '../models/User';
import { User } from '../models/User';
import { NotFoundError } from '../utils/AppError';

export interface QrValidationResult {
  user: IUser;
  isValid: true;
}

export class QrService {
  async validateToken(token: string): Promise<IUser> {
    const user = await User.findByQrToken(token);

    if (!user) {
      throw new NotFoundError('Invalid QR token');
    }

    return user;
  }

  async validateTokenOrNull(token: string): Promise<IUser | null> {
    return User.findByQrToken(token);
  }
}

export const qrService = new QrService();
