const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('../../shared/config/env');

/**
 * Profile Upload Middleware
 * Handles profile picture uploads via Cloudinary
 * Stores files in the 'profile_images' folder on Cloudinary
 */

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — streams directly to the profile_images folder
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const userId = req.user ? req.user.id : 'unknown';
        return {
            folder: 'profile_images',
            public_id: `profile-${userId}-${Date.now()}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        };
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed. Accepted: JPEG, PNG, WebP, GIF.'), false);
    }
};

const profileUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = profileUpload;
