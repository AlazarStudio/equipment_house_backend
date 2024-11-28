const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 48 }, // лимит размера файла 48MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Ошибка: недопустимый тип файла!');
  },
});

// Функция загрузки документов с проверкой типов файлов
const uploadDocuments = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 256 }, // лимит размера файла 256MB
  fileFilter: (req, file, cb) => {
    cb(null, true); // Временно пропускаем все файлы для тестирования
  },
  // fileFilter: (req, file, cb) => {
  // 	// Объявление переменной с допустимыми типами файлов
  // 	const allowedFileTypes = /pdf|doc|docx|xls|xlsx|rtf/
  // 	const extname = allowedFileTypes.test(
  // 		path.extname(file.originalname).toLowerCase()
  // 	)

  // 	// Выводим mimetype в консоль для проверки
  // 	console.log('Тип файла:', file.mimetype)

  // 	// Проверка для rtf и других документов
  // 	const mimetype =
  // 		file.mimetype === 'application/rtf' ||
  // 		file.mimetype === 'application/octet-stream' ||
  // 		allowedFileTypes.test(file.mimetype)

  // 	if (mimetype && extname) {
  // 		return cb(null, true)
  // 	} else {
  // 		cb(new Error('Ошибка: недопустимый тип документа!'))
  // 	}
  // }
});