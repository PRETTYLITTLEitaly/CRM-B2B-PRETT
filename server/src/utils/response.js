/**
 * Helper per standardizzare le risposte del server.
 */
const sendResponse = (res, statusCode, data, message = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = { sendResponse };
