const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// In production (e.g., Render), set UPLOAD_DIR to a persistent disk mount path
// so uploaded files (profile images, attachments) survive restarts/redeploys.
const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeOriginalName = path
            .basename(file.originalname)
            .replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeOriginalName}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept all files as per requirement "Upload photo, video, PDF, or any file extension"
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;
