const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const summariesRoutes = require('./routes/summaries');
const postsRouter = require('./routes/postRoutes');
const emailRoutes = require('./routes/emailRoutes'); // Email routes
// Initialize Express app
const app = express();

// Connect to MySQL
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/summaries', summariesRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/email',emailRoutes ); // Email route
// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));