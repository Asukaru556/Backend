//postController
const pool = require('../config/db');

const getAllPosts = async (req, res) => {
    try {
        const { category_id } = req.query;

        let query = `
            SELECT posts.id, posts.title, posts.description, 
                   posts.created_at, users.username,
                   categories.id as category_id, categories.name as category_name
            FROM posts 
            JOIN users ON posts.user_id = users.id
            JOIN categories ON posts.category_id = categories.id
        `;

        const params = [];

        if (category_id) {
            query += ' WHERE posts.category_id = ?';
            params.push(category_id);
        }

        const [posts] = await pool.query(query, params);
        res.json(posts);
    } catch (error) {
        console.error('Error in getAllPosts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const [posts] = await pool.query('SELECT id, title, description FROM posts WHERE id = ?', [id]);

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const userId = req.user.id;

        if (!title || !description || !category_id) {
            return res.status(400).json({
                message: 'Title, description and category_id are required'
            });
        }

        const [category] = await pool.query(
            'SELECT id FROM categories WHERE id = ?',
            [category_id]
        );

        if (!category.length) {
            return res.status(400).json({ message: 'Category not found' });
        }

        const [result] = await pool.query(
            'INSERT INTO posts (title, description, user_id, category_id) VALUES (?, ?, ?, ?)',
            [title, description, userId, category_id]
        );

        const [newPost] = await pool.query(`
            SELECT
                posts.*,
                users.username,
                categories.name as category_name
            FROM posts
                     JOIN users ON posts.user_id = users.id
                     JOIN categories ON posts.category_id = categories.id
            WHERE posts.id = ?
        `, [result.insertId]);

        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE id = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found or not owned by user' });
        }

        await pool.query(
            'UPDATE posts SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );

        const [updatedPost] = await pool.query(
            'SELECT id, title, description FROM posts WHERE id = ?',
            [id]
        );

        res.json(updatedPost[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found or not owned by user' });
        }

        await pool.query('DELETE FROM posts WHERE id = ?', [id]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPostsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        const [posts] = await pool.query(`
            SELECT posts.id, posts.title, posts.description, 
                   posts.created_at, users.username,
                   categories.id as category_id, categories.name as category_name
            FROM posts 
            JOIN users ON posts.user_id = users.id
            JOIN categories ON posts.category_id = categories.id
            WHERE posts.category_id = ?
            ORDER BY posts.created_at DESC
        `, [category_id]);

        res.json(posts);
    } catch (error) {
        console.error('Error in getPostsByCategory:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostsByCategory,
    getAllCategories
};