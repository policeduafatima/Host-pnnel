require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deployments', require('./routes/deployments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Serve HTML files
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
});

app.get('/deployments', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/deployments.html'));
});

// Add similar routes for other pages...

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Create admin user if not exists
    initializeAdmin();
});

async function initializeAdmin() {
    const User = require('./models/User');
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            email: 'policeduafatima@,gmail.com',
            password: hashedPassword,
            role: 'admin',
            coins: Infinity
        });
        console.log('Admin user created');
    }
}
