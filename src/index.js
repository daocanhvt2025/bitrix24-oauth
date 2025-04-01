const express = require('express');
const authController = require('./controllers/authController');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/auth/install', authController.handleInstall); // Xử lý sự kiện Install
app.get('/auth/callback', authController.handleCallback); // Callback sau khi authorize
app.post('/api/call', authController.callApi); // Endpoint gọi API bất kỳ

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});