import { IUser } from '../models/User';
import { User } from '../models/User';
import { NotFoundError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';

export interface QrValidationResult {
  user: IUser;
  isValid: true;
}

export class QrService {
  async validateToken(token: string): Promise<IUser> {
    const user = await User.findByQrToken(token);

    if (!user) {
      throw new NotFoundError('Invalid QR token', ERROR_CODES.INVALID_QR_TOKEN);
    }

    return user;
  }

  async validateTokenOrNull(token: string): Promise<IUser | null> {
    return User.findByQrToken(token);
  }
}

export const qrService = new QrService();
