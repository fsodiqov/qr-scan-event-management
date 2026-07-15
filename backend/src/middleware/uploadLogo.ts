import multer from 'multer';
import { BadRequestError } from '../utils/AppError';
import { LOGO_MAX_UPLOAD_BYTES } from '../utils/processLogo';

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: {
    fileSize: LOGO_MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadRequestError('Please upload an image file'));
      return;
    }
    cb(null, true);
  },
});

export const uploadOrganizationLogo = imageUpload.single('logo');

export const uploadUserPhoto = imageUpload.single('photo');
