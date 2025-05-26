// In src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const v1WorkoutRouter = require('./v1/routes/workoutRoutes');
const authRoutes = require('./v1/routes/authRoutes');
const postRoutes = require('./v1/routes/postRoutes');

const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workouts', v1WorkoutRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});