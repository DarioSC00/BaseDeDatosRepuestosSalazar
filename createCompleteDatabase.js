require('dotenv').config();
const mongoose = require('mongoose');

// Importar todos los modelos
const Category = require('./models/Category');
const Product = require('./models/Product');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');
const Client = require('./models/Client');
const Supplier = require('./models/Supplier');
const Status = require('./models/Status');
const Sale = require('./models/Sale');
const SaleDetail = require('./models/SaleDetail');
const Shopping = require('./models/Shopping');
const ShoppingDetail = require('./models/ShoppingDetail');
const Credit = require('./models/Credit');
const CreditDetail = require('./models/CreditDetail');
const CreditNew = require('./models/CreditNew');
const Dashboard = require('./models/Dashboard');
const DashboardDetail = require('./models/DashboardDetail');
const Devolution = require('./models/Devolution');
const DevolutionDetail = require('./models/DevolutionDetail');
const Fertilizer = require('./models/Fertilizer');
const Counter = require('./models/Counter');
const Notification = require('./models/Notification');
const NotificationDetail = require('./models/NotificationDetail');

const LOCAL_DB = 'mongodb://localhost:27017/repuestossalazar';
const ATLAS_DB = process.env.MONGODB_URI;

const createCompleteDatabase = async () => {
  try {
    console.log('🚀 Creando base de datos completa en MongoDB Atlas');
    console.log('==================================================');
    
    if (!ATLAS_DB || ATLAS_DB.includes('localhost')) {
      throw new Error('❌ MONGODB_URI no está configurado para Atlas');
    }
    
    // Conectar a ambas bases de datos
    console.log('📥 Conectando a MongoDB local...');
    const localConnection = await mongoose.createConnection(LOCAL_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('☁️  Conectando a MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Definir todas las colecciones que deben existir
    const collections = [
      { name: 'categories', model: Category, displayName: 'Categories' },
      { name: 'products', model: Product, displayName: 'Products' },
      { name: 'permissions', model: Permission, displayName: 'Permissions' },
      { name: 'roles', model: Role, displayName: 'Roles' },
      { name: 'users', model: User, displayName: 'Users' },
      { name: 'clients', model: Client, displayName: 'Clients' },
      { name: 'suppliers', model: Supplier, displayName: 'Suppliers' },
      { name: 'status', model: Status, displayName: 'Status' },
      { name: 'sales', model: Sale, displayName: 'Sales' },
      { name: 'saledetails', model: SaleDetail, displayName: 'SaleDetails' },
      { name: 'shoppings', model: Shopping, displayName: 'Shoppings' },
      { name: 'shoppingdetails', model: ShoppingDetail, displayName: 'ShoppingDetails' },
      { name: 'credits', model: Credit, displayName: 'Credits' },
      { name: 'creditdetails', model: CreditDetail, displayName: 'CreditDetails' },
      { name: 'creditnews', model: CreditNew, displayName: 'CreditNews' },
      { name: 'dashboards', model: Dashboard, displayName: 'Dashboards' },
      { name: 'dashboarddetails', model: DashboardDetail, displayName: 'DashboardDetails' },
      { name: 'devolutions', model: Devolution, displayName: 'Devolutions' },
      { name: 'devolutiondetails', model: DevolutionDetail, displayName: 'DevolutionDetails' },
      { name: 'fertilizers', model: Fertilizer, displayName: 'Fertilizers' },
      { name: 'counters', model: Counter, displayName: 'Counters' },
      { name: 'notifications', model: Notification, displayName: 'Notifications' },
      { name: 'notificationdetails', model: NotificationDetail, displayName: 'NotificationDetails' }
    ];
    
    console.log(`\n🗂️  Procesando ${collections.length} colecciones...\n`);
    
    let totalMigrated = 0;
    let collectionsCreated = 0;
    
    for (const collection of collections) {
      try {
        console.log(`📦 Procesando ${collection.displayName}...`);
        
        // Crear modelos para ambas conexiones
        const LocalModel = localConnection.model(collection.displayName, collection.model.schema);
        const AtlasModel = atlasConnection.model(collection.displayName, collection.model.schema);
        
        // Obtener datos de local
        const localData = await LocalModel.find({});
        console.log(`   📥 Encontrados ${localData.length} documentos en local`);
        
        // Limpiar colección en Atlas
        await AtlasModel.deleteMany({});
        
        if (localData.length > 0) {
          // Insertar datos
          await AtlasModel.insertMany(localData);
          console.log(`   ✅ ${localData.length} documentos migrados`);
          totalMigrated += localData.length;
        } else {
          // Crear colección vacía insertando y eliminando un documento temporal
          const tempDoc = new AtlasModel({});
          try {
            // Intentar crear un documento temporal válido
            const sampleData = {};
            if (collection.model.schema.paths.name) {
              sampleData.name = 'temp_document_to_create_collection';
            }
            if (collection.model.schema.paths.description) {
              sampleData.description = 'Temporal';
            }
            if (collection.model.schema.paths.status) {
              sampleData.status = 'TEMP';
            }
            
            const temp = await AtlasModel.create(sampleData);
            await AtlasModel.findByIdAndDelete(temp._id);
            console.log(`   📁 Colección vacía creada`);
          } catch (error) {
            // Si no se puede crear un documento temporal, solo registrar la colección
            console.log(`   📁 Colección registrada (sin crear documento temporal)`);
          }
        }
        
        collectionsCreated++;
        
      } catch (error) {
        console.error(`   ❌ Error procesando ${collection.displayName}:`, error.message);
      }
    }
    
    console.log('\n==================================================');
    console.log('🎉 Proceso completado!');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Colecciones procesadas: ${collectionsCreated}/${collections.length}`);
    console.log(`   - Total documentos migrados: ${totalMigrated}`);
    console.log('==================================================');
    
    // Verificar colecciones creadas en Atlas
    console.log('\n🔍 Verificando colecciones en Atlas...');
    const atlasCollections = await atlasConnection.db.listCollections().toArray();
    console.log(`📁 Total colecciones en Atlas: ${atlasCollections.length}`);
    
    console.log('\n📋 Colecciones encontradas:');
    atlasCollections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });
    
    // Verificar conteos
    console.log('\n📊 Conteo de documentos por colección:');
    for (const collection of collections) {
      try {
        const AtlasModel = atlasConnection.model(collection.displayName, collection.model.schema);
        const count = await AtlasModel.countDocuments();
        if (count > 0) {
          console.log(`   ✅ ${collection.displayName}: ${count} documentos`);
        } else {
          console.log(`   📁 ${collection.displayName}: 0 documentos (colección creada)`);
        }
      } catch (error) {
        console.log(`   ❌ ${collection.displayName}: Error al contar`);
      }
    }
    
    // Cerrar conexiones
    await localConnection.close();
    await atlasConnection.close();
    console.log('\n🔌 Conexiones cerradas');
    
    return { collectionsCreated, totalMigrated };
    
  } catch (error) {
    console.error('💥 Error en creación completa:', error.message);
    throw error;
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  createCompleteDatabase()
    .then((result) => {
      console.log(`\n✅ Proceso exitoso! ${result.collectionsCreated} colecciones, ${result.totalMigrated} documentos`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Proceso fallido:', error.message);
      process.exit(1);
    });
}

module.exports = { createCompleteDatabase };
