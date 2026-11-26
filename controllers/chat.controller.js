const chatbotService = require('../services/chatbot.service');
const asyncHandler = require('../utils/asyncHandler');

const handleChat = asyncHandler(async (req, res) => {
  const { message, action } = req.body || {};
  const result = await chatbotService.processChat({ message, action });

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = { handleChat };
