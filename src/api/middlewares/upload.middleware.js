const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload Middleware
 * Handles multipart file uploads for consultation documents
 * Stores files at: uploads/consultations/{consultationId}/
 */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const consultationId = req.params.id;
        const dir = path.join(process.cwd(), 'uploads', 'consultations', String(consultationId));

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed. Accepted: images, PDF, Word documents.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

module.exports = upload;
