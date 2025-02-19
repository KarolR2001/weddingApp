import multer from 'multer';

// Konfiguracja multer
const upload = multer({
    storage: multer.memoryStorage(), // Plik przechowywany w pamięci
  });

export const uploadMiddleware = upload.single('file');
