const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDataFromToken } = require('../utils/getDataFromToken');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/messages');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating upload directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Upload directory created successfully');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination called with file:', file.originalname);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('File filter checking file:', file.originalname, 'MIME type:', file.mimetype);
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      console.log('File type accepted');
      return cb(null, true);
    }
    console.log('File type rejected');
    cb(new Error('Invalid file type!'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('file');

async function uploadMessageFile(req, res) {
  console.log('Upload request received');
  
  // Check authentication first
  const userData = getDataFromToken(req);
  if (!userData || !userData.userid) {
    console.log('Unauthorized: No valid user data');
    return res.status(401).json({ error: "Unauthorized" });
  }

  upload(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      // Get relative path for storage
      const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
      const fileUrl = relativePath.replace(/\\/g, '/');
      
      console.log('File upload details:', {
        originalName: req.file.originalname,
        path: req.file.path,
        relativePath: relativePath,
        fileUrl: fileUrl,
        exists: fs.existsSync(req.file.path)
      });

      return res.status(200).json({ fileUrl });
    } catch (error) {
      console.error("Error in uploadMessageFile:", error);
      return res.status(400).json({ error: error.message });
    }
  });
}

module.exports = {
  uploadMessageFile
}; 