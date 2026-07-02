import { cloudinary } from '../config/cloudinary.js';
import { Upload } from '../models/index.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/csv']);

function assertFile(file) {
  if (!file) {
    const error = new Error('File is required');
    error.statusCode = 400;
    throw error;
  }
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    const error = new Error('Unsupported file type');
    error.statusCode = 400;
    throw error;
  }
}

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'aegis-disaster-platform', resource_type: 'auto' },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(file.buffer);
  });
}

export async function listUploads() {
  return Upload.findAll({ order: [['createdAt', 'DESC']] });
}

export async function createUpload(userId, file, metadata = {}) {
  assertFile(file);
  const result = await uploadToCloudinary(file);
  return Upload.create({
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: result.secure_url,
    publicId: result.public_id,
    storageProvider: 'cloudinary',
    metadata,
    uploadedById: userId
  });
}

export async function deleteUpload(id) {
  const upload = await Upload.findByPk(id);
  if (!upload) {
    const error = new Error('Upload not found');
    error.statusCode = 404;
    throw error;
  }
  if (upload.publicId) {
    await cloudinary.uploader.destroy(upload.publicId, { resource_type: 'image' }).catch(() => null);
    await cloudinary.uploader.destroy(upload.publicId, { resource_type: 'raw' }).catch(() => null);
  }
  await upload.destroy();
  return { id };
}
