const pool = require('../config/db');

const getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM categories WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Category already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );

        const [newCategory] = await pool.query(
            'SELECT id, name FROM categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newCategory[0]);
    } catch (error) {
        console.error('Error in createCategory:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const [category] = await pool.query(
            'SELECT id FROM categories WHERE id = ?',
            [id]
        );

        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM categories WHERE name = ? AND id != ?',
            [name, id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Category name already exists' });
        }

        await pool.query(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, id]
        );

        const [updatedCategory] = await pool.query(
            'SELECT id, name FROM categories WHERE id = ?',
            [id]
        );

        res.json(updatedCategory[0]);
    } catch (error) {
        console.error('Error in updateCategory:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [category] = await pool.query(
            'SELECT id FROM categories WHERE id = ?',
            [id]
        );

        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const [models] = await pool.query(
            'SELECT id FROM models WHERE category_id = ?',
            [id]
        );

        if (models.length > 0) {
            return res.status(409).json({
                message: 'Cannot delete category: it has associated models'
            });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await pool.query(
            'SELECT id, name FROM categories WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error('Error in getCategoryById:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
};