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
        is_active: Boolean(model.is_active),
        is_stock: Boolean(model.is_stock),
        position: model.position !== undefined ? model.position : 0,
        button_name: model.button_name || '',
        tempImage: null,
        tempModel: null,
    };
}

const initializeModelsTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS models (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_path VARCHAR(255),
                model_path VARCHAR(255) NOT NULL,
                price DECIMAL(10,2),
                direct_purchase_url VARCHAR(255),
                category_id INT,
                is_active TINYINT(1) DEFAULT 1,
                is_stock TINYINT(1) DEFAULT 0,
                position INT DEFAULT 0,
                button_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `;

        await pool.query(createTableQuery);
        console.log('Models table initialized successfully');
    } catch (error) {
        console.error('Error initializing models table:', error);
        throw error;
    }
};

initializeModelsTable().catch(console.error);

const getAllModels = async (req, res) => {
    try {
        const [models] = await pool.query('SELECT * FROM models ORDER BY position ASC, id DESC');
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
            is_active,
            is_stock,
            position,
            button_name
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
             (title, description, image_path, model_path, price, direct_purchase_url, category_id, is_active, is_stock, position, button_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, image_path, model_path, price, direct_purchase_url, category_id, is_active ?? true, is_stock ?? false, position ?? 0, button_name || '']
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
            is_active,
            is_stock,
            position,
            button_name
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
            category_id: category_id !== undefined ? category_id : existingModel.category_id,
            is_active: is_active !== undefined ? is_active : existingModel.is_active,
            is_stock: is_stock !== undefined ? is_stock : existingModel.is_stock,
            position: position !== undefined ? position : existingModel.position,
            button_name: button_name !== undefined ? button_name : existingModel.button_name,
        };

        await pool.query(
            `UPDATE models SET
                title = ?,
                description = ?,
                image_path = ?,
                model_path = ?,
                price = ?,
                direct_purchase_url = ?,
                category_id = ?,
                is_active = ?,
                is_stock = ?,
                position = ?,
                button_name = ?
             WHERE id = ?`,
            [
                updateData.title,
                updateData.description,
                updateData.image_path,
                updateData.model_path,
                updateData.price,
                updateData.direct_purchase_url,
                updateData.category_id,
                updateData.is_active,
                updateData.is_stock,
                updateData.position,
                updateData.button_name,
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

const updateModelsPositions = async (req, res) => {
    let connection;
    try {
        const { models: modelsToUpdate } = req.body;

        if (!Array.isArray(modelsToUpdate)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        connection = await pool.getConnection();

        await connection.beginTransaction();

        for (const model of modelsToUpdate) {
            await connection.query(
                'UPDATE models SET position = ? WHERE id = ?',
                [model.position, model.id]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Positions updated successfully' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error in updateModelsPositions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};



module.exports = {
    getAllModels,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    updateModelsPositions,
};
