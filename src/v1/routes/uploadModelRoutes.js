const express = require('express');
const router = express.Router();
const authMiddleware = require('../../midlleWare/authMidlleWare');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка хранилища для Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/models/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    console.log('Тип файла:', file.mimetype);
    const allowedTypes = ['model/gltf-binary', 'application/octet-stream'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый тип файла. Разрешены только .glb модели.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 50 } // 50MB
});

// Маршрут для загрузки модели
router.post('/models', authMiddleware, upload.single('model'), (req, res) => {
    try {
        if (!req.file) {
            console.warn('Файл не был получен');
            return res.status(400).json({ error: 'Модель не была загружена' });
        }

        const modelUrl = `${req.protocol}://${req.get('host')}/uploads/models/${req.file.filename}`;

        res.status(201).json({
            message: 'Модель успешно загружена',
            modelUrl: modelUrl
        });
    } catch (error) {
        console.error('Ошибка при загрузке модели:', error);
        res.status(500).json({ error: 'Ошибка при загрузке модели' });
    }
});

module.exports = router;
