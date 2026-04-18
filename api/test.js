module.exports = (req, res) => {
  res.status(200).send("API TEST OK - " + new Date().toISOString());
};
