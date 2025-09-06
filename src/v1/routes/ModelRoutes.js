const express = require('express');
const router = express.Router();
const modelController = require('../../controllers/modelController');

router.get('/', modelController.getAllModels);
router.get('/:id', modelController.getModelById);
router.post('/', modelController.createModel);
router.put('/:id', modelController.updateModel);
router.delete('/:id', modelController.deleteModel);
router.patch('/positions', modelController.updateModelsPositions);

module.exports = router;