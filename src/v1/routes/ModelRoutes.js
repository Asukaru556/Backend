const express = require('express');
const router = express.Router();
const modelController = require('../../controllers/modelController');
const authMiddleware = require("../../midlleWare/authMidlleWare");

router.get('/', modelController.getAllModels);
router.get('/:id', modelController.getModelById);
router.post('/',authMiddleware, modelController.createModel);
router.put('/:id',authMiddleware, modelController.updateModel);
router.delete('/:id',authMiddleware, modelController.deleteModel);
router.patch('/positions',authMiddleware, modelController.updateModelsPositions);

module.exports = router;