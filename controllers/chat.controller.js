const { processUserMessage } = require('../services/gemini.service');
const asyncHandler = require('../utils/asyncHandler');

const handleChat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const reply = await processUserMessage(message);

    res.status(200).json({
        success: true,
        data: { reply }
    });
});

module.exports = { handleChat };