import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import { qrTokenParamSchema } from '../validators/qr.validator';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_SCAN),
);

router.get(
  '/validate/:token',
  validate(qrTokenParamSchema, 'params'),
  qrController.validate.bind(qrController),
);

export default router;
