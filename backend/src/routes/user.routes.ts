import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validators/user.validator';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_USERS_MANAGE),
);

router.post(
  '/',
  validate(createUserSchema),
  userController.create.bind(userController),
);

router.get(
  '/',
  validate(listUsersSchema, 'query'),
  userController.list.bind(userController),
);

router.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.getById.bind(userController),
);

router.put(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  userController.update.bind(userController),
);

router.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.remove.bind(userController),
);

export default router;
