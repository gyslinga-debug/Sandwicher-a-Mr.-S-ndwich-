const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Actualizar perfil - protegido
router.put('/profile', verifyToken, (req, res, next) => {
  return authController.updateProfile(req, res, next);
});

module.exports = router;
