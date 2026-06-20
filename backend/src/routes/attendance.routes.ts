import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { authorize, authorizeSelfOrAdmin } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { ROLES } from '../constants/roles';
import { scanRateLimiter } from '../middleware/rateLimiter';
import {
  attendanceIdParamSchema,
  createAttendanceSchema,
  eventIdAttendanceParamSchema,
  listAttendanceSchema,
  scanSchema,
  updateAttendanceSchema,
  userIdAttendanceParamSchema,
} from '../validators/attendance.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/scan',
  authorize(ROLES.ADMIN),
  scanRateLimiter,
  validate(scanSchema),
  attendanceController.scan.bind(attendanceController),
);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createAttendanceSchema),
  attendanceController.create.bind(attendanceController),
);

router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate(listAttendanceSchema, 'query'),
  attendanceController.list.bind(attendanceController),
);

router.get(
  '/event/:eventId',
  authorize(ROLES.ADMIN),
  validate(eventIdAttendanceParamSchema, 'params'),
  validate(listAttendanceSchema, 'query'),
  attendanceController.getByEvent.bind(attendanceController),
);

router.get(
  '/user/:userId',
  validate(userIdAttendanceParamSchema, 'params'),
  authorizeSelfOrAdmin,
  validate(listAttendanceSchema, 'query'),
  attendanceController.getByUser.bind(attendanceController),
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(attendanceIdParamSchema, 'params'),
  attendanceController.getById.bind(attendanceController),
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(attendanceIdParamSchema, 'params'),
  validate(updateAttendanceSchema),
  attendanceController.update.bind(attendanceController),
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(attendanceIdParamSchema, 'params'),
  attendanceController.remove.bind(attendanceController),
);

export default router;
