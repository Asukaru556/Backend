// In src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./v1/routes/authRoutes');
const postRoutes = require('./v1/routes/postRoutes');
const uploadImageRoutes = require('./v1/routes/uploadImageRoutes');
const categoryRoutes = require('./v1/routes/categoryRoutes');
const uploadModelRoutes = require('./v1/routes/uploadModelRoutes');
const modelRoutes = require('./v1/routes/ModelRoutes');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:9001',
    credentials: true
}));

app.use(bodyParser.json());

app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload/', uploadImageRoutes);
app.use('/api/v1/upload/', uploadModelRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/models', modelRoutes)

const parentDir = path.join(__dirname, '..');
app.use('/uploads', express.static(path.join(parentDir, 'uploads')));

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});