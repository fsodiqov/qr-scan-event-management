import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission, authorizeSuperAdmin } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { uploadOrganizationLogo } from '../middleware/uploadLogo';
import { PERMISSIONS } from '../constants/permissions';
import {
  createOrganizationSchema,
  listOrganizationsSchema,
  organizationIdParamSchema,
  updateMyOrganizationSchema,
  updateOrganizationSchema,
} from '../validators/organization.validator';
import {
  listOrganizationUsersSchema,
  organizationUserIdParamSchema,
  updateOrganizationUserSchema,
} from '../validators/organizationUser.validator';

const router = Router();

router.get(
  '/me',
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_SETTINGS),
  organizationController.getMe.bind(organizationController),
);

router.put(
  '/me',
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_SETTINGS),
  validate(updateMyOrganizationSchema),
  organizationController.updateMe.bind(organizationController),
);

router.post(
  '/me/logo',
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_SETTINGS),
  uploadOrganizationLogo,
  organizationController.uploadMyLogo.bind(organizationController),
);

router.use(authenticate, authorizeSuperAdmin);

router.post(
  '/',
  validate(createOrganizationSchema),
  organizationController.create.bind(organizationController),
);

router.get(
  '/',
  validate(listOrganizationsSchema, 'query'),
  organizationController.list.bind(organizationController),
);

router.get(
  '/:id',
  validate(organizationIdParamSchema, 'params'),
  organizationController.getById.bind(organizationController),
);

router.put(
  '/:id',
  validate(organizationIdParamSchema, 'params'),
  validate(updateOrganizationSchema),
  organizationController.update.bind(organizationController),
);

router.get(
  '/:id/members',
  validate(organizationIdParamSchema, 'params'),
  validate(listOrganizationUsersSchema, 'query'),
  organizationController.listMembers.bind(organizationController),
);

router.put(
  '/:id/members/:memberId',
  validate(
    organizationIdParamSchema.extend({
      memberId: organizationUserIdParamSchema.shape.id,
    }),
    'params',
  ),
  validate(updateOrganizationUserSchema),
  organizationController.updateMember.bind(organizationController),
);

router.delete(
  '/:id',
  validate(organizationIdParamSchema, 'params'),
  organizationController.remove.bind(organizationController),
);

export default router;
