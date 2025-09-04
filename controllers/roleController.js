const roleService = require('../services/roleService');

function isProtectedRoleByName(role) {
  if (!role || !role.name) return false;
  const n = String(role.name).toLowerCase();
  return n.includes('admin') || n.includes('administrador');
}

// Crear un nuevo rol
exports.createRole = async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ message: 'Rol creado correctamente', role });
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear el rol.' });
  }
};

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message || 'No se pudieron obtener los roles.' });
  }
};

// Obtener un rol por ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message || 'No se pudo obtener el rol.' });
  }
};

// Actualizar un rol
exports.updateRole = async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json({ message: 'Rol actualizado exitosamente', role });
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo actualizar el rol.' });
  }
};

// Eliminar un rol
exports.deleteRole = async (req, res) => {
  try {
  // fetch role first to validate protected roles
  const existing = await roleService.getRoleById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Rol no encontrado.' });
  if (isProtectedRoleByName(existing)) return res.status(403).json({ error: 'No se puede eliminar el rol administrador.' });

  const role = await roleService.deleteRole(req.params.id);
  if (!role) return res.status(404).json({ error: 'Rol no encontrado.' });
  res.json({ message: 'Rol eliminado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo eliminar el rol.' });
  }
};

// Ejemplo de función para cambiar estado
exports.changeRoleStatus = async (req, res) => {
  try {
  // fetch role first to validate protected roles
  const existing = await roleService.getRoleById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Rol no encontrado.' });
  if (isProtectedRoleByName(existing)) return res.status(403).json({ error: 'No se puede cambiar el estado del rol administrador.' });

  const role = await roleService.changeRoleStatus(req.params.id, req.body.status);
  res.json({ message: 'El estado del rol se cambió correctamente.', role });
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo cambiar el estado del rol.' });
  }
};
