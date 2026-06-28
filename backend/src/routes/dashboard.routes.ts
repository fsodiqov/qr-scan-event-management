import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_DASHBOARD),
);

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/recent', dashboardController.getRecent.bind(dashboardController));

export default router;
