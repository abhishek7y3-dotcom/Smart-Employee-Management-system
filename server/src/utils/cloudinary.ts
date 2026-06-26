import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });
  console.log('cloudinary.ts: Cloudinary SDK configured successfully.');
} else {
  console.log('cloudinary.ts: Warning - Cloudinary environment variables are missing. File uploads will fallback to default placeholder avatars.');
}

export async function uploadToCloudinary(base64Image: string, userName: string): Promise<string> {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff&size=200&bold=true`;

  if (!base64Image) {
    return defaultAvatar;
  }

  if (!isCloudinaryConfigured) {
    return defaultAvatar;
  }

  try {
    // base64Image can be in format: "data:image/png;base64,iVBORw0KGgoAAAANS..." or plain base64.
    // Cloudinary upload API accepts data URI format or base64.
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'employee_task_manager_avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });
    console.log('cloudinary.ts: Successfully uploaded avatar to Cloudinary:', uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('cloudinary.ts: Error uploading image to Cloudinary:', error);
    // Graceful fallback to default avatar so that user registration does not crash
    return defaultAvatar;
  }
}
