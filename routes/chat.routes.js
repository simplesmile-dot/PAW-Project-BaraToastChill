const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const validateChatInput = require('../middlewares/validateChatInput');

// Endpoint POST /api/chat dengan middleware validasi
router.post('/chat', validateChatInput, chatController.handleChat);

module.exports = router;