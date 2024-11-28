import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // Файлы хранятся в памяти в формате Buffer
  limits: { fileSize: 10 * 1024 * 1024 }, // Лимит размера файла - 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Разрешить загрузку только изображений
    } else {
      cb(new Error('Только изображения разрешены!')); // Отклонить файлы, не являющиеся изображениями
    }
  },
});

export default upload;
