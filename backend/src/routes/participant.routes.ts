import { Router } from 'express';
import { participantController } from '../controllers/participant.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  createParticipantSchema,
  eventIdParticipantParamSchema,
  listParticipantsSchema,
  participantIdParamSchema,
  updateParticipantSchema,
} from '../validators/participant.validator';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_PARTICIPANTS_MANAGE),
);

router.post(
  '/',
  validate(createParticipantSchema),
  participantController.create.bind(participantController),
);

router.get(
  '/',
  validate(listParticipantsSchema, 'query'),
  participantController.list.bind(participantController),
);

router.get(
  '/:id',
  validate(participantIdParamSchema, 'params'),
  participantController.getById.bind(participantController),
);

router.put(
  '/:id',
  validate(participantIdParamSchema, 'params'),
  validate(updateParticipantSchema),
  participantController.update.bind(participantController),
);

router.delete(
  '/:id',
  validate(participantIdParamSchema, 'params'),
  participantController.remove.bind(participantController),
);

router.get(
  '/:id/qr',
  validate(participantIdParamSchema, 'params'),
  participantController.getQr.bind(participantController),
);

router.post(
  '/:id/regenerate-qr',
  validate(participantIdParamSchema, 'params'),
  participantController.regenerateQr.bind(participantController),
);

export { eventIdParticipantParamSchema };
export default router;
