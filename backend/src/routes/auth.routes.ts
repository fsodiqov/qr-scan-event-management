import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { uploadUserPhoto } from '../middleware/uploadLogo';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
);

router.post('/logout', authenticate, authController.logout.bind(authController));

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
