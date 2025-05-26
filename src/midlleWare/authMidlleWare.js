const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        // Получение токена из заголовка
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Верификация токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Поиск пользователя в базе данных
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users[0];

        // Добавление пользователя в запрос
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;