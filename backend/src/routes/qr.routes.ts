import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/validate/:token', qrController.validate.bind(qrController));

export default router;
