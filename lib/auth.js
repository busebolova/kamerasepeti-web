const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function checkPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
}

module.exports = { hashPassword, checkPassword, requireAuth };
