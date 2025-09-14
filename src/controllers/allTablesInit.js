const pool = require("../config/db");
const initializeCategoriesTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )
        `;

        await pool.query(createTableQuery);
        console.log('Categories table initialized successfully');
    } catch (error) {
        console.error('Error initializing categories table:', error);
        throw error;
    }
};

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

const initializeUsersTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await pool.query(createTableQuery);
        console.log('Users table initialized successfully');
    } catch (error) {
        console.error('Error initializing users table:', error);
        throw error;
    }
};

const initializeAllTables = async () => {
    try {
        await initializeCategoriesTable();
        await initializeModelsTable();
        await initializeUsersTable();

        console.log("all tables initialized successfully")
    }catch (error) {
        console.log("Error initializing tables",error)
    }
}

initializeAllTables()