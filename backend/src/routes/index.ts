import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventRoutes from './event.routes';
import attendanceRoutes from './attendance.routes';
import qrRoutes from './qr.routes';
import dashboardRoutes from './dashboard.routes';
import organizationRoutes from './organization.routes';
import organizationUserRoutes from './organizationUser.routes';
import subscriptionRoutes from './subscription.routes';
import participantRoutes from './participant.routes';
import platformDashboardRoutes from './platformDashboard.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/participants', participantRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/qr', qrRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/organizations', organizationRoutes);
router.use('/organization-users', organizationUserRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/platform/dashboard', platformDashboardRoutes);

export default router;
