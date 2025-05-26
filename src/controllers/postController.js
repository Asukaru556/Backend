const pool = require('../config/db');

const getAllPosts = async (req, res) => {
    try {
        const { category } = req.query;

        let query = `
            SELECT posts.id, posts.title, posts.description, 
                   posts.category, posts.created_at, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id
        `;

        const params = [];

        if (category) {
            query += ' WHERE posts.category = ?';
            params.push(category);
        }

        const [posts] = await pool.query(query, params);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        const { title, description, category = 'other' } = req.body;
        const userId = req.user.id;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Проверяем допустимые категории
        const allowedCategories = ['foreign', 'funny', 'politics', 'other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const [result] = await pool.query(
            'INSERT INTO posts (title, description, user_id, category) VALUES (?, ?, ?, ?)',
            [title, description, userId, category]
        );

        const [newPost] = await pool.query(`
            SELECT posts.id, posts.title, posts.description, 
                   posts.category, posts.created_at, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id
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
        const userId = req.user.id;

        // Проверяем, существует ли пост и принадлежит ли пользователю
        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [id, userId]
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

        // Проверяем, существует ли пост и принадлежит ли пользователю
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
        const { category } = req.params;

        // Проверяем допустимые категории
        const allowedCategories = ['foreign', 'funny', 'politics', 'other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const [posts] = await pool.query(`
            SELECT posts.id, posts.title, posts.description, 
                   posts.category, posts.created_at, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id
            WHERE posts.category = ?
            ORDER BY posts.created_at DESC
        `, [category]);

        res.json(posts);
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
    getPostsByCategory
};