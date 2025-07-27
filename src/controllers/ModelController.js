const pool = require('../config/db');

function formatModel(model) {
    return {
        id: model.id,
        title: model.title,
        description: model.description,
        image_path: model.image_path || null,
        model_path: model.model_path || null,
        price: model.price !== undefined ? model.price : null,
        direct_purchase_url: model.direct_purchase_url || '',
        category_id: model.category_id || null,
        tempImage: null,
        tempModel: null,
    };
}

const getAllModels = async (req, res) => {
    try {
        const [models] = await pool.query('SELECT * FROM models');
        const formattedModels = models.map(formatModel);
        res.status(200).json(formattedModels);
    } catch (error) {
        console.error('Error in getAllModels:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

const getModelById = async (req, res) => {
    try {
        const { id } = req.params;
        const [models] = await pool.query('SELECT * FROM models WHERE id = ?', [id]);
        if (models.length === 0) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const formattedModel = formatModel(models[0]);
        res.status(200).json(formattedModel);
    } catch (error) {
        console.error('Error in getModelById:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

const createModel = async (req, res) => {
    try {
        const {
            title,
            description,
            image_path,
            model_path,
            price,
            direct_purchase_url,
            category_id,
        } = req.body;

        if (!title || !model_path) {
            return res.status(400).json({ message: 'Title and model file are required' });
        }

        const [existing] = await pool.query('SELECT id FROM models WHERE title = ?', [title]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Model with this title already exists' });
        }

        const [result] = await pool.query(
            `INSERT INTO models
             (title, description, image_path, model_path, price, direct_purchase_url, category_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, image_path, model_path, price, direct_purchase_url, category_id]
        );

        const [newModels] = await pool.query('SELECT * FROM models WHERE id = ?', [result.insertId]);
        const formattedModel = formatModel(newModels[0]);
        res.status(201).json(formattedModel);
    } catch (error) {
        console.error('Error in createModel:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

const updateModel = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            image_path,
            model_path,
            price,
            direct_purchase_url,
            category_id,
        } = req.body;

        const [existingModels] = await pool.query('SELECT * FROM models WHERE id = ?', [id]);
        if (existingModels.length === 0) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const existingModel = existingModels[0];

        if (title) {
            const [existingTitle] = await pool.query(
                'SELECT id FROM models WHERE title = ? AND id != ?',
                [title, id]
            );
            if (existingTitle.length > 0) {
                return res.status(409).json({ message: 'Model with this title already exists' });
            }
        }

        const updateData = {
            title: title || existingModel.title,
            description: description || existingModel.description,
            image_path: image_path || existingModel.image_path,
            model_path: model_path || existingModel.model_path,
            price: price !== undefined ? price : existingModel.price,
            direct_purchase_url: direct_purchase_url || existingModel.direct_purchase_url,
            category_id: category_id !== undefined ? category_id : existingModel.category_id,  // Обновляем category_id
        };

        await pool.query(
            `UPDATE models SET
                title = ?,
                description = ?,
                image_path = ?,
                model_path = ?,
                price = ?,
                direct_purchase_url = ?,
                category_id = ?
             WHERE id = ?`,
            [
                updateData.title,
                updateData.description,
                updateData.image_path,
                updateData.model_path,
                updateData.price,
                updateData.direct_purchase_url,
                updateData.category_id,
                id,
            ]
        );

        const [updatedModels] = await pool.query('SELECT * FROM models WHERE id = ?', [id]);
        const formattedModel = formatModel(updatedModels[0]);
        res.status(200).json(formattedModel);
    } catch (error) {
        console.error('Error in updateModel:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

const deleteModel = async (req, res) => {
    try {
        const { id } = req.params;
        const [existingModels] = await pool.query('SELECT id FROM models WHERE id = ?', [id]);
        if (existingModels.length === 0) {
            return res.status(404).json({ message: 'Model not found' });
        }
        await pool.query('DELETE FROM models WHERE id = ?', [id]);
        res.status(200).json({ message: 'Model deleted successfully' });
    } catch (error) {
        console.error('Error in deleteModel:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getAllModels,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
};
