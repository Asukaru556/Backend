// In src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./v1/routes/authRoutes');
const postRoutes = require('./v1/routes/postRoutes');
const uploadRoutes = require('./v1/routes/uploadRoutes');
const path = require('path');
const multer = require('multer');
const categoryRoutes = require('./v1/routes/categoryRoutes');
const modelsRoutes = require('./v1/routes/modelRoutes');
const authMiddleware = require('./midlleWare/authMidlleWare');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/posts', authMiddleware, postRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload',authMiddleware, uploadRoutes);
app.use('/api/v1/upload',authMiddleware, modelsRoutes);
app.use('/api/v1/categories',authMiddleware, categoryRoutes);

// Маршрут для доступа к загруженным файлам
const parentDir = path.join(__dirname, '..');
app.use('/uploads', express.static(path.join(parentDir, 'uploads')));

// Обработка ошибок Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});