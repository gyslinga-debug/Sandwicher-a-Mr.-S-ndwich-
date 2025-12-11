const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generar token JWT (incluye role y userId)
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' } // Cambiado a 24 horas para mejor persistencia
  );
};

// Registrar usuario
exports.register = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    // Verificar si usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('Register attempt with existing email:', email);
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear usuario
    const user = new User({
      name,
      email,
      password,
      phone,
      addresses: address ? [{ street: address }] : []
    });

    await user.save();

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('Login failed - user not found:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('Login failed - invalid password for:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      console.warn('Login attempt on inactive account:', email);
      return res.status(403).json({ message: 'Cuenta desactivada' });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;
    user.updatedAt = Date.now();

    await user.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Solicitar código de recuperación de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    const user = await User.findOne({ email });
    
    // Por seguridad, siempre retornamos éxito incluso si el usuario no existe
    if (!user) {
      console.log('Password reset requested for non-existent email:', email);
      return res.json({ message: 'Si el correo existe, recibirás un código de recuperación' });
    }

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();

    // En producción, aquí enviarías un email con el código
    // Por ahora, lo mostramos en consola para desarrollo
    console.log('==============================================');
    console.log(`🔑 Código de recuperación para ${email}: ${resetCode}`);
    console.log(`⏰ Expira: ${resetCodeExpires.toLocaleString('es-CL')}`);
    console.log('==============================================');

    res.json({ 
      message: 'Código de recuperación enviado a tu correo',
      // En desarrollo, incluimos el código en la respuesta
      devCode: process.env.NODE_ENV !== 'production' ? resetCode : undefined
    });
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Restablecer contraseña con código
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ Contraseña restablecida para: ${email}`);

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Cambiar contraseña (usuario autenticado)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener usuario del token (agregado por middleware)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    console.log(`✅ Contraseña cambiada para: ${user.email}`);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};