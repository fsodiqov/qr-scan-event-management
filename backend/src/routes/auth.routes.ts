import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, updateProfileSchema, sessionIdParamSchema } from '../validators/auth.validator';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { uploadUserPhoto } from '../middleware/uploadLogo';
import { requireAllowedOrigin } from '../middleware/requireAllowedOrigin';

const router = Router();

router.post(
  '/login',
  requireAllowedOrigin,
  loginRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
);

router.post(
  '/refresh',
  requireAllowedOrigin,
  authController.refresh.bind(authController),
);

router.post(
  '/logout',
  requireAllowedOrigin,
  authController.logout.bind(authController),
);

router.post(
  '/logout-all',
  authenticate,
  requireAllowedOrigin,
  authController.logoutAll.bind(authController),
);

router.get('/sessions', authenticate, authController.listSessions.bind(authController));

router.delete(
  '/sessions/:id',
  authenticate,
  requireAllowedOrigin,
  validate(sessionIdParamSchema, 'params'),
  authController.revokeSession.bind(authController),
);

router.get('/me', authenticate, authController.me.bind(authController));

router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  authController.updateMe.bind(authController),
);

router.post(
  '/me/photo',
  authenticate,
  uploadUserPhoto,
  authController.uploadMyPhoto.bind(authController),
);

export default router;
