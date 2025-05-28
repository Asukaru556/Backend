const express = require('express');
const router = express.Router();
const authMiddleware = require('../../midlleWare/authMidlleWare');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка хранилища для Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/images/';
        // Создаем папку, если ее нет
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

// Фильтр файлов (разрешаем только изображения)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый тип файла. Разрешены только изображения.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Ограничение 5MB
});

// Маршрут для загрузки изображения
router.post('/images', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Изображение не было загружено' });
        }

        // Формируем URL для доступа к изображению
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;


        res.status(201).json({
            message: 'Пост успешно создан',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при создании поста' });
    }
});

module.exports = router;