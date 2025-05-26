const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authContoller');
const authMiddleWare = require('../../midlleWare/authMidlleWare')

// Регистрация
router.post('/register', authController.register);

// Авторизация
router.post('/login', authController.login);

// Защищенный маршрут для теста
router.get('/user', authMiddleWare, authController.getUser);

module.exports = router;