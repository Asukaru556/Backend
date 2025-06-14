//categoryRoutes
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/categoryControler');

router.get('/', postController.getAllCategories);
router.get('/:id', postController.getCategoryById);
router.post('/add', postController.createCategory);
router.delete('/:id', postController.deleteCategory);
router.put('/:id', postController.updateCategory);
module.exports = router;