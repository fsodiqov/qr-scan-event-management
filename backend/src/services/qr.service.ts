import { IParticipant } from '../models/Participant';
import { Participant } from '../models/Participant';
import { NotFoundError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';
import { AuthContext } from '../types';
import { scopeToOrganization } from '../utils/tenantScope';

export interface QrValidationResult {
  participant: IParticipant;
  isValid: true;
}

export class QrService {
  async validateToken(auth: AuthContext, token: string): Promise<IParticipant> {
    const participant = await Participant.findOne({
      ...scopeToOrganization(auth, {}),
      qrToken: token,
      isActive: true,
    });

    if (!participant) {
      throw new NotFoundError('Invalid QR token', ERROR_CODES.INVALID_QR_TOKEN);
    }

    return participant;
  }

  async validateTokenOrNull(token: string): Promise<IParticipant | null> {
    return Participant.findByQrToken(token);
  }
}

export const qrService = new QrService();
