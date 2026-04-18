/**
 * Wrapper per eliminare i blocchi try-catch dai controller.
 * Cattura gli errori e li passa automaticamente al middleware di gestione errori.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
