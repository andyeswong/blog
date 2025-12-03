// Middleware de autenticación simple con password hardcoded
const ADMIN_PASSWORD = '6rayMatterLabs';

/**
 * Middleware para verificar si el usuario está autenticado
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  res.redirect('/admin/login');
}

/**
 * Middleware para verificar credenciales de login
 */
function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

module.exports = {
  requireAuth,
  verifyPassword
};
