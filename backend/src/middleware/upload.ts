import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
// Default: 20MB (20971520 bytes) - can be overridden via MAX_FILE_SIZE env var
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '20971520'); // 20MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Single image upload
export const uploadSingle = upload.single('image');

// Multiple images upload (max 10 files, each up to MAX_FILE_SIZE)
export const uploadMultiple = upload.array('images', 10);

// Any field name (fallback)
export const uploadAny = upload.any();

