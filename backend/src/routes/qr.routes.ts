import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_SCAN),
);

router.get('/validate/:token', qrController.validate.bind(qrController));

export default router;
