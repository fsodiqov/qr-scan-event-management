import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/recent', dashboardController.getRecent.bind(dashboardController));

export default router;
