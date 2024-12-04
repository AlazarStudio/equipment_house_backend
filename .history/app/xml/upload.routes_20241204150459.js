import express from 'express';
const multer = require('multer');
const uploadController = require('./uploadController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Маршрут для загрузки файла
router.post('/upload', upload.single('file'), uploadController);

export default router;
