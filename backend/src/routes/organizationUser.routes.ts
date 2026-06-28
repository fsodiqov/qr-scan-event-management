import { Router } from 'express';
import { organizationUserController } from '../controllers/organizationUser.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  createOrganizationUserSchema,
  listOrganizationUsersSchema,
  organizationUserIdParamSchema,
  updateOrganizationUserSchema,
} from '../validators/organizationUser.validator';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_USERS_MANAGE),
);

router.post(
  '/',
  validate(createOrganizationUserSchema),
  organizationUserController.create.bind(organizationUserController),
);

router.get(
  '/',
  validate(listOrganizationUsersSchema, 'query'),
  organizationUserController.list.bind(organizationUserController),
);

router.get(
  '/:id',
  validate(organizationUserIdParamSchema, 'params'),
  organizationUserController.getById.bind(organizationUserController),
);

router.put(
  '/:id',
  validate(organizationUserIdParamSchema, 'params'),
  validate(updateOrganizationUserSchema),
  organizationUserController.update.bind(organizationUserController),
);

router.delete(
  '/:id',
  validate(organizationUserIdParamSchema, 'params'),
  organizationUserController.remove.bind(organizationUserController),
);

export default router;
