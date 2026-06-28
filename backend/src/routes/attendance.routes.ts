import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { authorizePermission } from '../middleware/authorize';
import { requireOrganization } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { PERMISSIONS } from '../constants/permissions';
import { scanRateLimiter } from '../middleware/rateLimiter';
import {
  attendanceIdParamSchema,
  createAttendanceSchema,
  eventIdAttendanceParamSchema,
  listAttendanceSchema,
  participantIdAttendanceParamSchema,
  scanSchema,
  updateAttendanceSchema,
} from '../validators/attendance.validator';

const router = Router();

router.use(authenticate, requireOrganization);

router.post(
  '/scan',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_SCAN),
  scanRateLimiter,
  validate(scanSchema),
  attendanceController.scan.bind(attendanceController),
);

router.post(
  '/',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(createAttendanceSchema),
  attendanceController.create.bind(attendanceController),
);

router.get(
  '/',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(listAttendanceSchema, 'query'),
  attendanceController.list.bind(attendanceController),
);

router.get(
  '/event/:eventId',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(eventIdAttendanceParamSchema, 'params'),
  validate(listAttendanceSchema, 'query'),
  attendanceController.getByEvent.bind(attendanceController),
);

router.get(
  '/participant/:participantId',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(participantIdAttendanceParamSchema, 'params'),
  validate(listAttendanceSchema, 'query'),
  attendanceController.getByParticipant.bind(attendanceController),
);

router.get(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(attendanceIdParamSchema, 'params'),
  attendanceController.getById.bind(attendanceController),
);

router.put(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(attendanceIdParamSchema, 'params'),
  validate(updateAttendanceSchema),
  attendanceController.update.bind(attendanceController),
);

router.delete(
  '/:id',
  authorizePermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
  validate(attendanceIdParamSchema, 'params'),
  attendanceController.remove.bind(attendanceController),
);

export default router;
