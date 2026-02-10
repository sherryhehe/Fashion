import express, { Request, Response } from 'express';
import { uploadSingle, uploadMultiple, uploadAny } from '../middleware/upload';
import { authenticate, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responseHelper';

const router = express.Router();

// Helper function to format upload errors
const formatUploadError = (err: any): string => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE || '20971520') / (1024 * 1024);
    return `File too large. Maximum file size is ${maxSizeMB}MB. Please compress your image or use a smaller file.`;
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return 'Too many files. Maximum 10 files allowed per upload.';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return 'Unexpected file field. Please use the correct field name.';
  }
  if (err.message) {
    return err.message;
  }
  return 'File upload failed. Please try again.';
};

// Single image upload
router.post('/image', authenticate, requireAdmin, (req: Request, res: Response) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      const errorMessage = formatUploadError(err);
      return errorResponse(res, errorMessage, 400);
    }

    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    successResponse(res, { url: fileUrl }, 'File uploaded successfully');
  });
});

// Multiple images upload
router.post('/images', authenticate, requireAdmin, (req: Request, res: Response) => {
  // Be flexible with field names using uploadAny fallback
  uploadAny(req, res, (err) => {
    if (err) {
      const errorMessage = formatUploadError(err);
      return errorResponse(res, errorMessage, 400);
    }

    const files = (req as any).files as Express.Multer.File[] | undefined;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }

    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    successResponse(res, { urls: fileUrls }, 'Files uploaded successfully');
  });
});

export default router;

