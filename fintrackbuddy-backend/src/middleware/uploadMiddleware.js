const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Uploads folder path
const uploadDir = path.join(__dirname, "../../uploads");

// ✅ Folder exist karta hai? Nahi to create karo
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: userId-timestamp.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `avatar-${req.userId}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ File filter (sirf images allow)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, gif, webp)"));
  }
};

// ✅ Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

module.exports = upload;
