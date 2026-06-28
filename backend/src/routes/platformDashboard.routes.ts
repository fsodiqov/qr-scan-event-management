import { Router } from 'express';
import { platformDashboardController } from '../controllers/platformDashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorizeSuperAdmin } from '../middleware/authorize';

const router = Router();

router.use(authenticate, authorizeSuperAdmin);

router.get(
  '/stats',
  platformDashboardController.getStats.bind(platformDashboardController),
);

export default router;
