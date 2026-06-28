import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { participantController } from '../controllers/participant.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  createEventSchema,
  eventIdParamSchema,
  listEventsSchema,
  updateEventSchema,
  updateEventStatusSchema,
} from '../validators/event.validator';
import {
  eventIdParticipantParamSchema,
  listParticipantsSchema,
} from '../validators/participant.validator';

const router = Router();

router.use(authenticate, requireOrganization);

router.post(
  '/',
  authorizePermission(PERMISSIONS.ORG_EVENTS_MANAGE),
  validate(createEventSchema),
  eventController.create.bind(eventController),
);

router.get(
  '/',
  authorizePermission(PERMISSIONS.ORG_EVENTS_READ),
  validate(listEventsSchema, 'query'),
  eventController.list.bind(eventController),
);

router.get(
  '/:eventId/participants',
  authorizePermission(PERMISSIONS.ORG_PARTICIPANTS_MANAGE),
  validate(eventIdParticipantParamSchema, 'params'),
  validate(listParticipantsSchema, 'query'),
  participantController.listByEvent.bind(participantController),
);

router.get(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_EVENTS_READ),
  validate(eventIdParamSchema, 'params'),
  eventController.getById.bind(eventController),
);

router.put(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_EVENTS_MANAGE),
  validate(eventIdParamSchema, 'params'),
  validate(updateEventSchema),
  eventController.update.bind(eventController),
);

router.patch(
  '/:id/status',
  authorizePermission(PERMISSIONS.ORG_EVENTS_MANAGE),
  validate(eventIdParamSchema, 'params'),
  validate(updateEventStatusSchema),
  eventController.updateStatus.bind(eventController),
);

router.delete(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_EVENTS_MANAGE),
  validate(eventIdParamSchema, 'params'),
  eventController.remove.bind(eventController),
);

export default router;
