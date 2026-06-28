import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission, authorizeSuperAdmin } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  createSubscriptionSchema,
  listSubscriptionsSchema,
  subscriptionIdParamSchema,
  updateSubscriptionSchema,
} from '../validators/subscription.validator';

const router = Router();

router.get(
  '/me',
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_SETTINGS),
  subscriptionController.getMySubscription.bind(subscriptionController),
);

router.use(authenticate, authorizeSuperAdmin);

router.post(
  '/',
  validate(createSubscriptionSchema),
  subscriptionController.create.bind(subscriptionController),
);

router.get(
  '/',
  validate(listSubscriptionsSchema, 'query'),
  subscriptionController.list.bind(subscriptionController),
);

router.get(
  '/:id',
  validate(subscriptionIdParamSchema, 'params'),
  subscriptionController.getById.bind(subscriptionController),
);

router.put(
  '/:id',
  validate(subscriptionIdParamSchema, 'params'),
  validate(updateSubscriptionSchema),
  subscriptionController.update.bind(subscriptionController),
);

export default router;
