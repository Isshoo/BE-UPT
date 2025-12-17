import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'upt-pik/images',
    allowed_formats: [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'tiff',
      'heic',
      'jfif',
      'avif',
      'ico',
      'raw',
    ],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// Storage for PDFs and documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'upt-pik/documents',
    allowed_formats: [
      'pdf',
      'doc',
      'docx',
      'txt',
      'odt',
      'rtf',
      'ppt',
      'pptx',
      'xls',
      'xlsx',
      'csv',
    ],
    resource_type: 'raw',
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
}); // 20MB limit
export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
export const uploadMultiple = multer({
  storage: new CloudinaryStorage({
    limits: { fileSize: 50 * 1024 * 1024 },
    cloudinary: cloudinary,
    params: {
      folder: 'upt-pik/files',
      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'pdf',
        'doc',
        'docx',
        'txt',
        'ppt',
        'pptx',
        'xls',
        'xlsx',
        'csv',
        'gif',
        'webp',
        'svg',
        'bmp',
        'tiff',
        'heic',
        'jfif',
        'avif',
        'ico',
        'raw',
        'rtf',
        'odt',
      ],
    },
  }),
});

export default cloudinary;
