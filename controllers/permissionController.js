const Permission = require('../models/Permission');

// Crear un nuevo permiso
exports.createPermission = async (req, res) => {
  try {
    const permission = new Permission(req.body);
    await permission.save();
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los permisos
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un permiso por ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un permiso
exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!permission) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un permiso
exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ message: 'Permiso eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
