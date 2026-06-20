import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorize, authorizeSelfOrAdmin } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { ROLES } from '../constants/roles';
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createUserSchema),
  userController.create.bind(userController),
);

router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate(listUsersSchema, 'query'),
  userController.list.bind(userController),
);

router.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  authorizeSelfOrAdmin,
  userController.getById.bind(userController),
);

router.put(
  '/:id',
  validate(userIdParamSchema, 'params'),
  authorize(ROLES.ADMIN),
  validate(updateUserSchema),
  userController.update.bind(userController),
);

router.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  authorize(ROLES.ADMIN),
  userController.remove.bind(userController),
);

router.get(
  '/:id/qr',
  validate(userIdParamSchema, 'params'),
  authorizeSelfOrAdmin,
  userController.getQr.bind(userController),
);

router.post(
  '/:id/regenerate-qr',
  validate(userIdParamSchema, 'params'),
  authorize(ROLES.ADMIN),
  userController.regenerateQr.bind(userController),
);

export default router;
