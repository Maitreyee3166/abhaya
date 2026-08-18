require("dotenv").config();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const fileType = ["jpg", "png", "jpeg", "webp", 'avif'];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUD_FOLDER,
    allowed_formats: fileType,

    public_id: (req, file) => {
        
      const originalName = file.originalname.split(".")[0];
      const uniqueName = originalName.replace(/\s+/g, "_") + "_" + Date.now();
      return uniqueName;
    },
  },
});

const uploadImg = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = uploadImg; 