function errorHandler(err, req, res, next) {
  console.error("Server error:", err);
  res.status(500).send("Internal server error");
}

module.exports = errorHandler;