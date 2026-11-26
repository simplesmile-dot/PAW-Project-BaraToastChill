// Express 4 tidak menangkap error dari fungsi async secara otomatis.
// Pembungkus ini meneruskan error ke error handler (errorController.serverError).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;