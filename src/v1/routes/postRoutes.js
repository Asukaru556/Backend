//postRoutes
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');
const authMiddleware = require('../../midlleWare/authMidlleWare');

router.get('/', postController.getAllPosts);

router.get('/:id', postController.getPostById);

router.get('/category/:category_id', postController.getPostsByCategory);

router.post('/', authMiddleware, postController.createPost);

router.put('/:id', authMiddleware, postController.updatePost);

router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;