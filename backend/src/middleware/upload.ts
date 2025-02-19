import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Zachowaj oryginalną nazwę pliku
  },
});

const upload = multer({ storage });
export default upload;
