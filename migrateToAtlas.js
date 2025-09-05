require('dotenv').config();
const mongoose = require('mongoose');

// Modelos
const Category = require('./models/Category');
const Product = require('./models/Product');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');
const Client = require('./models/Client');
const Supplier = require('./models/Supplier');
const SaleDetail = require('./models/SaleDetail');

// Configuraciones de base de datos
const LOCAL_DB = 'mongodb://localhost:27017/repuestossalazar';
const ATLAS_DB = process.env.MONGODB_URI;

const migrateToAtlas = async () => {
  try {
    console.log('🚀 Iniciando migración de datos locales a MongoDB Atlas');
    console.log('====================================================');
    
    if (!ATLAS_DB || ATLAS_DB.includes('localhost')) {
      throw new Error('❌ MONGODB_URI no está configurado para Atlas');
    }
    
    // Conectar a base de datos local
    console.log('📥 Conectando a MongoDB local...');
    const localConnection = await mongoose.createConnection(LOCAL_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB local');
    
    // Conectar a MongoDB Atlas
    console.log('☁️  Conectando a MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Definir modelos para ambas conexiones
    const localModels = {
      Category: localConnection.model('Category', Category.schema),
      Product: localConnection.model('Product', Product.schema),
      Permission: localConnection.model('Permission', Permission.schema),
      Role: localConnection.model('Role', Role.schema),
      User: localConnection.model('User', User.schema),
      Client: localConnection.model('Client', Client.schema),
      Supplier: localConnection.model('Supplier', Supplier.schema),
      SaleDetail: localConnection.model('SaleDetail', SaleDetail.schema)
    };
    
    const atlasModels = {
      Category: atlasConnection.model('Category', Category.schema),
      Product: atlasConnection.model('Product', Product.schema),
      Permission: atlasConnection.model('Permission', Permission.schema),
      Role: atlasConnection.model('Role', Role.schema),
      User: atlasConnection.model('User', User.schema),
      Client: atlasConnection.model('Client', Client.schema),
      Supplier: atlasConnection.model('Supplier', Supplier.schema),
      SaleDetail: atlasConnection.model('SaleDetail', SaleDetail.schema)
    };
    
    console.log('\n🔄 Iniciando migración de colecciones...');
    console.log('=========================================');
    
    const collections = [
      'Category', 'Product', 'Permission', 'Role', 
      'User', 'Client', 'Supplier', 'SaleDetail'
    ];
    
    let totalMigrated = 0;
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📦 Procesando ${collectionName}...`);
        
        // Obtener datos de local
        const localData = await localModels[collectionName].find({});
        console.log(`   📥 Encontrados ${localData.length} documentos en local`);
        
        if (localData.length === 0) {
          console.log(`   ⚪ Saltando ${collectionName} (sin datos)`);
          continue;
        }
        
        // Limpiar colección en Atlas (opcional)
        await atlasModels[collectionName].deleteMany({});
        console.log(`   🗑️  Limpieza de ${collectionName} en Atlas`);
        
        // Insertar datos en Atlas
        if (localData.length > 0) {
          await atlasModels[collectionName].insertMany(localData);
          console.log(`   ✅ ${localData.length} documentos migrados a Atlas`);
          totalMigrated += localData.length;
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrando ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n====================================================');
    console.log('🎉 Migración completada!');
    console.log(`📊 Total documentos migrados: ${totalMigrated}`);
    console.log('====================================================');
    
    // Verificar datos en Atlas
    console.log('\n🔍 Verificando datos en Atlas...');
    for (const collectionName of collections) {
      try {
        const count = await atlasModels[collectionName].countDocuments();
        console.log(`   ${collectionName}: ${count} documentos`);
      } catch (error) {
        console.log(`   ${collectionName}: Error - ${error.message}`);
      }
    }
    
    // Cerrar conexiones
    await localConnection.close();
    await atlasConnection.close();
    console.log('\n🔌 Conexiones cerradas');
    
    return totalMigrated;
    
  } catch (error) {
    console.error('💥 Error en migración:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n📋 Para solucionar:');
      console.log('1. Verifica que MONGODB_URI esté configurado para Atlas');
      console.log('2. Asegúrate de que la cadena de conexión sea correcta');
    }
    
    throw error;
  }
};

// Función para verificar estado después de migración
const verifyMigration = async () => {
  try {
    console.log('🔍 Verificando estado después de migración...');
    
    await mongoose.connect(ATLAS_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const collections = [
      { name: 'Categories', model: Category },
      { name: 'Products', model: Product },
      { name: 'Permissions', model: Permission },
      { name: 'Roles', model: Role },
      { name: 'Users', model: User },
      { name: 'Clients', model: Client },
      { name: 'Suppliers', model: Supplier },
      { name: 'SaleDetails', model: SaleDetail }
    ];
    
    console.log('📊 Estado en MongoDB Atlas:');
    console.log('==========================');
    
    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`✅ ${collection.name}: ${count} documentos`);
      } catch (error) {
        console.log(`❌ ${collection.name}: Error`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0];
  
  if (action === 'verify') {
    verifyMigration();
  } else {
    migrateToAtlas()
      .then(() => {
        console.log('\n✅ Migración exitosa!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Migración fallida:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { migrateToAtlas, verifyMigration };
