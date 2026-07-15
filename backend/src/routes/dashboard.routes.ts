import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import {
  dashboardReportQuerySchema,
  dashboardStatsQuerySchema,
} from '../validators/dashboard.validator';

const router = Router();

router.use(
  authenticate,
  requireOrganization,
  authorizePermission(PERMISSIONS.ORG_DASHBOARD),
);

router.get(
  '/stats',
  validate(dashboardStatsQuerySchema, 'query'),
  dashboardController.getStats.bind(dashboardController),
);
router.get(
  '/report',
  validate(dashboardReportQuerySchema, 'query'),
  dashboardController.getReport.bind(dashboardController),
);
router.get('/recent', dashboardController.getRecent.bind(dashboardController));

export default router;
