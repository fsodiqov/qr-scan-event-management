import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { ROLES } from '../constants/roles';
import {
  createEventSchema,
  eventIdParamSchema,
  listEventsSchema,
  updateEventSchema,
  updateEventStatusSchema,
} from '../validators/event.validator';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.post(
  '/',
  validate(createEventSchema),
  eventController.create.bind(eventController),
);

router.get(
  '/',
  validate(listEventsSchema, 'query'),
  eventController.list.bind(eventController),
);

router.get(
  '/:id',
  validate(eventIdParamSchema, 'params'),
  eventController.getById.bind(eventController),
);

router.put(
  '/:id',
  validate(eventIdParamSchema, 'params'),
  validate(updateEventSchema),
  eventController.update.bind(eventController),
);

router.patch(
  '/:id/status',
  validate(eventIdParamSchema, 'params'),
  validate(updateEventStatusSchema),
  eventController.updateStatus.bind(eventController),
);

router.delete(
  '/:id',
  validate(eventIdParamSchema, 'params'),
  eventController.remove.bind(eventController),
);

export default router;
