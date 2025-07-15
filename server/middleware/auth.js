function authRequired(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

function roleRequired(role) {
  return function (req, res, next) {
    if (req.session.user?.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}

module.exports = { authRequired, roleRequired };