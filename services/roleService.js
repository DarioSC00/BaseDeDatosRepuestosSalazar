const Role = require('../models/Role');
const User = require('../models/User');

async function createRole(data) {
  if (!data.name) throw new Error('El nombre del rol es requerido.');
  data.name = String(data.name).trim();
  data.description = data.description ? String(data.description).trim().slice(0,250) : '';
  const nombreRol = data.name.toLowerCase();
  const existing = await Role.findOne({ name: { $regex: `^${nombreRol}$`, $options: 'i' } });
  if (existing) throw new Error('Ya existe un rol con ese nombre.');
  const role = new Role(data);
  await role.save();
  return role;
}

async function getAllRoles() {
  return await Role.find().populate('permissions');
}

async function getRoleById(id) {
  return await Role.findById(id).populate('permissions');
}

async function updateRole(id, data) {
  if (!data.name) throw new Error('El nombre del rol es requerido.');
  data.name = String(data.name).trim();
  data.description = data.description ? String(data.description).trim().slice(0,250) : '';
  const nombreRol = data.name.toLowerCase();
  const existing = await Role.findOne({ _id: { $ne: id }, name: { $regex: `^${nombreRol}$`, $options: 'i' } });
  if (existing) throw new Error('Ya existe un rol con ese nombre.');
  const role = await Role.findByIdAndUpdate(id, data, { new: true });
  return role;
}

async function deleteRole(id) {
  const usersWithRole = await User.find({ role: id });
  if (usersWithRole.length > 0) throw new Error('No se puede eliminar el rol porque tiene usuarios asociados.');
  const role = await Role.findByIdAndDelete(id);
  return role;
}

async function changeRoleStatus(id, status) {
  const role = await Role.findById(id);
  if (!role) throw new Error('Rol no encontrado.');
  if (role.name.toLowerCase() === 'admin') throw new Error('No se puede cambiar el estado del rol Admin.');
  role.status = status;
  await role.save();
  return role;
}

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  changeRoleStatus
};
