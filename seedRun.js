require('dotenv').config();
const path = require('path');

async function run() {
  try {
    // Ejecutar script que crea permisos y rol Admin
    const asignar = require('./asignarPermisosAdmin');
    if (typeof asignar === 'function') {
      await asignar(process.env.MONGODB_URI);
      console.log('asignarPermisosAdmin ejecutado correctamente');
    } else if (asignar && typeof asignar.main === 'function') {
      await asignar.main(process.env.MONGODB_URI);
      console.log('asignarPermisosAdmin.main ejecutado correctamente');
    }

    // Ejecutar otros seeds si existen en db/seed
    const seedDir = path.join(__dirname, 'db', 'seed');
    try {
      const populateProducts = require('./db/seed/populateProducts');
      if (typeof populateProducts === 'function') {
        await populateProducts(process.env.MONGODB_URI);
        console.log('populateProducts ejecutado correctamente');
      }
    } catch (e) {
      // Ignorar si no existe
    }

    console.log('Todos los seeds (disponibles) se ejecutaron.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seedRun:', err);
    process.exit(1);
  }
}

run();
