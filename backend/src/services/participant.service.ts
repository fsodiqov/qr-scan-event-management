import QRCode from 'qrcode';
import { FilterQuery, Types } from 'mongoose';
import { Participant, IParticipant } from '../models/Participant';
import { Event } from '../models/Event';
import { ERROR_CODES } from '../constants/errorCodes';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { generateQrToken, buildQrUrl, QR_CODE_OPTIONS } from '../utils/qrToken';
import {
  CreateParticipantInput,
  ListParticipantsQuery,
  UpdateParticipantInput,
} from '../validators/participant.validator';
import { PaginationMeta, AuthContext } from '../types';
import { requireOrganizationId, scopeToOrganization } from '../utils/tenantScope';

export interface ParticipantListResult {
  participants: IParticipant[];
  meta: PaginationMeta;
}

export interface QrCodeResult {
  qrToken: string;
  qrUrl: string;
  qrDataUrl: string;
}

export class ParticipantService {
  async create(auth: AuthContext, input: CreateParticipantInput): Promise<IParticipant> {
    const organizationId = requireOrganizationId(auth);

    const event = await Event.findOne({
      _id: input.eventId,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!event) {
      throw new NotFoundError('Event not found', ERROR_CODES.EVENT_NOT_FOUND);
    }

    const participant = new Participant({
      organizationId: new Types.ObjectId(organizationId),
      eventId: new Types.ObjectId(input.eventId),
      name: input.name,
      email: input.email?.toLowerCase(),
      phone: input.phone,
      photoUrl: input.photoUrl || undefined,
      qrToken: generateQrToken(),
      isActive: true,
    });

    await participant.save();
    return participant;
  }

  async findAll(
    auth: AuthContext,
    query: ListParticipantsQuery,
  ): Promise<ParticipantListResult> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IParticipant> = scopeToOrganization(
      auth,
      {},
    ) as FilterQuery<IParticipant>;

    if (query.eventId) {
      filter.eventId = new Types.ObjectId(query.eventId);
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    } else {
      filter.isActive = true;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [participants, total] = await Promise.all([
      Participant.find(filter)
        .populate('eventId', 'title location eventDate status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Participant.countDocuments(filter),
    ]);

    return {
      participants,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findByEvent(
    auth: AuthContext,
    eventId: string,
    query: ListParticipantsQuery,
  ): Promise<ParticipantListResult> {
    return this.findAll(auth, { ...query, eventId });
  }

  async findById(auth: AuthContext, id: string): Promise<IParticipant> {
    const filter = scopeToOrganization(auth, { _id: id });
    const participant = await Participant.findOne(filter).populate(
      'eventId',
      'title location eventDate status',
    );

    if (!participant) {
      throw new NotFoundError('Participant not found', ERROR_CODES.PARTICIPANT_NOT_FOUND);
    }

    return participant;
  }

  async update(
    auth: AuthContext,
    id: string,
    input: UpdateParticipantInput,
  ): Promise<IParticipant> {
    const participant = await this.findById(auth, id);

    if (input.name) participant.name = input.name;
    if (input.email) participant.email = input.email.toLowerCase();
    if (input.phone) participant.phone = input.phone;
    if (input.photoUrl !== undefined) participant.photoUrl = input.photoUrl || undefined;
    if (input.isActive !== undefined) participant.isActive = input.isActive;

    await participant.save();
    return participant;
  }

  async softDelete(auth: AuthContext, id: string): Promise<IParticipant> {
    const participant = await this.findById(auth, id);
    participant.isActive = false;
    await participant.save();
    return participant;
  }

  async getQrCode(auth: AuthContext, id: string): Promise<QrCodeResult> {
    const participant = await this.findById(auth, id);

    if (!participant.qrToken) {
      throw new BadRequestError('Participant does not have a QR token', undefined, ERROR_CODES.NO_QR_TOKEN);
    }

    const qrUrl = buildQrUrl(participant.qrToken);
    const qrDataUrl = await QRCode.toDataURL(participant.qrToken, QR_CODE_OPTIONS);

    return {
      qrToken: participant.qrToken,
      qrUrl,
      qrDataUrl,
    };
  }

  async regenerateQrToken(auth: AuthContext, id: string): Promise<QrCodeResult> {
    const participant = await this.findById(auth, id);
    participant.qrToken = generateQrToken();
    await participant.save();
    return this.getQrCode(auth, id);
  }

  async assertParticipantInEvent(
    participant: IParticipant,
    eventId: string,
    organizationId: string,
  ): Promise<void> {
    if (participant.eventId.toString() !== eventId) {
      throw new ForbiddenError(
        'Participant does not belong to this event',
        ERROR_CODES.PARTICIPANT_NOT_IN_EVENT,
      );
    }

    if (participant.organizationId.toString() !== organizationId) {
      throw new ForbiddenError('Organization access denied', ERROR_CODES.ORG_ACCESS_DENIED);
    }
  }
}

export const participantService = new ParticipantService();
