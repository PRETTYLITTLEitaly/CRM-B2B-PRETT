const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Errore di validazione',
      errors: errorDetails,
    });
  }

  // Sostituiamo il body con il valore validato (che include i default)
  req.body = value;
  next();
};

module.exports = validate;
