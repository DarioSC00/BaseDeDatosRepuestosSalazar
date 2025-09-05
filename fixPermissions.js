require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('./models/Permission');

const LOCAL_DB = 'mongodb://localhost:27017/repuestossalazar';
const ATLAS_DB = process.env.MONGODB_URI;

const migratePermissions = async () => {
  try {
    console.log('🔧 Migrando permisos específicamente...');
    
    // Conectar a local
    const localConnection = await mongoose.createConnection(LOCAL_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Conectar a Atlas
    const atlasConnection = await mongoose.createConnection(ATLAS_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const LocalPermission = localConnection.model('Permission', Permission.schema);
    const AtlasPermission = atlasConnection.model('Permission', Permission.schema);
    
    // Obtener permisos de local
    const localPermissions = await LocalPermission.find({});
    console.log(`📥 Encontrados ${localPermissions.length} permisos en local`);
    
    // Mostrar algunos ejemplos
    console.log('📋 Ejemplos de permisos:');
    localPermissions.slice(0, 5).forEach((perm, index) => {
      console.log(`   ${index + 1}. "${perm.name}"`);
    });
    
    // Limpiar Atlas
    await AtlasPermission.deleteMany({});
    console.log('🗑️  Permisos limpiados en Atlas');
    
    // Insertar uno por uno para ver errores específicos
    let successCount = 0;
    let errorCount = 0;
    
    for (const permission of localPermissions) {
      try {
        await AtlasPermission.create({
          name: permission.name,
          created_at: permission.created_at,
          updated_at: permission.updated_at
        });
        successCount++;
      } catch (error) {
        console.log(`❌ Error con permiso "${permission.name}": ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Permisos migrados exitosamente: ${successCount}`);
    console.log(`❌ Permisos con error: ${errorCount}`);
    
    // Verificar en Atlas
    const atlasCount = await AtlasPermission.countDocuments();
    console.log(`📊 Total permisos en Atlas: ${atlasCount}`);
    
    await localConnection.close();
    await atlasConnection.close();
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

migratePermissions();
