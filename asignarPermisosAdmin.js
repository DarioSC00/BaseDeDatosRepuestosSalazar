// Script para crear permisos y asignarlos al rol Admin en MongoDB
const mongoose = require('mongoose');
const Permission = require('./models/Permission');
const Role = require('./models/Role');

// Usar MONGODB_URI desde variables de entorno si está disponible
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_basededatos'; // Cambia por tu URI real

const permisos = [
  { name: "ver_dashboard" },
  { name: "ver_usuarios" },
  { name: "crear_usuarios" },
  { name: "editar_usuarios" },
  { name: "eliminar_usuarios" },
  { name: "ver_roles" },
  { name: "crear_roles" },
  { name: "editar_roles" },
  { name: "eliminar_roles" },
  { name: "ver_permisos" },
  { name: "crear_permisos" },
  { name: "editar_permisos" },
  { name: "eliminar_permisos" },
  { name: "ver_productos" },
  { name: "crear_productos" },
  { name: "editar_productos" },
  { name: "eliminar_productos" },
  { name: "ver_proveedores" },
  { name: "crear_proveedores" },
  { name: "editar_proveedores" },
  { name: "eliminar_proveedores" },
  { name: "ver_compras" },
  { name: "crear_compras" },
  { name: "editar_compras" },
  { name: "eliminar_compras" },
  { name: "ver_ventas" },
  { name: "crear_ventas" },
  { name: "editar_ventas" },
  { name: "eliminar_ventas" },
  { name: "ver_categoria" },
  { name: "crear_categoria" },
  { name: "editar_categoria" },
  { name: "eliminar_categoria" },
  { name: "ver_credito" },
  { name: "crear_credito" },
  { name: "editar_credito" },
  { name: "eliminar_credito" }
];

async function main(uri) {
  const connectUri = uri || MONGO_URI;
  await mongoose.connect(connectUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  // Crear permisos si no existen
  for (const permiso of permisos) {
    await Permission.updateOne(
      { name: permiso.name },
      { $setOnInsert: permiso },
      { upsert: true }
    );
  }
  const permisosDocs = await Permission.find({ name: { $in: permisos.map(p => p.name) } });
  const permisosIds = permisosDocs.map(p => p._id);
  // Asignar permisos al rol Admin
  await Role.updateOne(
    { name: "Admin" },
    { $set: { permissions: permisosIds } }
  );
  console.log('Permisos creados y asignados al rol Admin.');
  await mongoose.disconnect();
}
module.exports = main;

if (require.main === module) {
  // Si se ejecuta directamente, leer .env y ejecutar
  require('dotenv').config();
  main(process.env.MONGODB_URI).catch(console.error);
}
