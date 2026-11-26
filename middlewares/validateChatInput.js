const validateChatInput = (req, res, next) => {
  const { message, action } = req.body || {};

  const hasAction = typeof action === 'string' && action.trim() !== '';
  const hasMessage = typeof message === 'string' && message.trim() !== '';

  if (!hasAction && !hasMessage) {
    return res.status(400).json({
      success: false,
      error: 'Pesan tidak boleh kosong.',
    });
  }

  if (typeof message === 'string' && message.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Pesan terlalu panjang. Maksimal 500 karakter.',
    });
  }

  next();
};

module.exports = validateChatInput;
