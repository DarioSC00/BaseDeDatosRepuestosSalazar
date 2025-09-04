const User = require('../models/User');

// Obtener el perfil del usuario autenticado (real)
exports.getProfile = async (req, res) => {
  try {
    // Obtener el usuario autenticado desde el token
    const user = await User.findById(req.userId).populate('role');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      // Campo duplicado
      const field = Object.keys(error.keyPattern)[0];
      const fieldMessages = {
        'email': 'El correo ya está registrado',
        'phone': 'El teléfono ya está registrado',
        'document': 'El documento ya está registrado'
      };
      return res.status(400).json({ msg: fieldMessages[field] || `El campo ${field} ya está registrado` });
    }
    res.status(400).json({ msg: error.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldMessages = {
        'email': 'El correo ya está registrado',
        'phone': 'El teléfono ya está registrado',
        'document': 'El documento ya está registrado'
      };
      return res.status(400).json({ msg: fieldMessages[field] || `El campo ${field} ya está registrado` });
    }
    res.status(400).json({ msg: error.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado de un usuario
exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    user.status = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    await user.save();

    res.json({ msg: 'Estado actualizado', user });
  } catch (error) {
    res.status(500).json({ msg: 'Error al cambiar estado', error: error.message });
  }
};

// Cambiar contraseña del usuario autenticado
exports.changePassword = async (req, res) => {
  try {
    console.log('🔐 Iniciando cambio de contraseña...');
    console.log('📋 UserId desde token:', req.userId);
    console.log('📋 Datos recibidos:', { 
      currentPassword: req.body.currentPassword ? '***' : 'undefined',
      newPassword: req.body.newPassword ? '***' : 'undefined'
    });
    
    const { currentPassword, newPassword } = req.body;
    
    // Validaciones
    if (!currentPassword || !newPassword) {
      console.log('❌ Faltan datos requeridos');
      return res.status(400).json({ msg: 'Contraseña actual y nueva son requeridas' });
    }
    
    if (newPassword.length < 6) {
      console.log('❌ Nueva contraseña muy corta');
      return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener el usuario autenticado
    console.log('🔍 Buscando usuario con ID:', req.userId);
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', user.full_name);
    console.log('🔐 Contraseña actual en BD:', user.password ? '***' : 'undefined');

    // Verificar la contraseña actual (comparación directa para texto plano)
    if (currentPassword !== user.password) {
      console.log('❌ Contraseña actual incorrecta');
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
    }

    console.log('✅ Contraseña actual verificada correctamente');

    // Actualizar la contraseña (guardar en texto plano como el resto del sistema)
    user.password = newPassword;
    await user.save();

    console.log('✅ Contraseña cambiada exitosamente');
    res.json({ msg: 'Contraseña cambiada correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ msg: 'Error al cambiar la contraseña', error: error.message });
  }
};
