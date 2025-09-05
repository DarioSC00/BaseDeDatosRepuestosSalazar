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
const Status = require('./models/Status');
const Sale = require('./models/Sale');
const SaleDetail = require('./models/SaleDetail');
const Shopping = require('./models/Shopping');
const ShoppingDetail = require('./models/ShoppingDetail');
const Credit = require('./models/Credit');
const CreditDetail = require('./models/CreditDetail');
const Dashboard = require('./models/Dashboard');
const DashboardDetail = require('./models/DashboardDetail');
const Devolution = require('./models/Devolution');
const DevolutionDetail = require('./models/DevolutionDetail');
const Fertilizer = require('./models/Fertilizer');

// Configuración para base de datos local
const LOCAL_DB = 'mongodb://localhost:27017/repuestossalazar';

const checkLocalData = async () => {
  try {
    console.log('🔍 Conectando a base de datos local...');
    await mongoose.connect(LOCAL_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB local');
    console.log('📊 Verificando datos en colecciones...');
    console.log('=======================================');
    
    const collections = [
      { name: 'Categories', model: Category },
      { name: 'Products', model: Product },
      { name: 'Permissions', model: Permission },
      { name: 'Roles', model: Role },
      { name: 'Users', model: User },
      { name: 'Clients', model: Client },
      { name: 'Suppliers', model: Supplier },
      { name: 'Status', model: Status },
      { name: 'Sales', model: Sale },
      { name: 'SaleDetails', model: SaleDetail },
      { name: 'Shoppings', model: Shopping },
      { name: 'ShoppingDetails', model: ShoppingDetail },
      { name: 'Credits', model: Credit },
      { name: 'CreditDetails', model: CreditDetail },
      { name: 'Dashboards', model: Dashboard },
      { name: 'DashboardDetails', model: DashboardDetail },
      { name: 'Devolutions', model: Devolution },
      { name: 'DevolutionDetails', model: DevolutionDetail },
      { name: 'Fertilizers', model: Fertilizer }
    ];
    
    const results = [];
    
    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        const result = {
          name: collection.name,
          count: count,
          hasData: count > 0
        };
        results.push(result);
        
        if (count > 0) {
          console.log(`✅ ${collection.name}: ${count} documentos`);
        } else {
          console.log(`⚪ ${collection.name}: 0 documentos`);
        }
      } catch (error) {
        console.log(`❌ ${collection.name}: Error - ${error.message}`);
        results.push({
          name: collection.name,
          count: 0,
          hasData: false,
          error: error.message
        });
      }
    }
    
    console.log('=======================================');
    
    const collectionsWithData = results.filter(r => r.hasData);
    const totalCollections = results.length;
    const collectionsWithDataCount = collectionsWithData.length;
    
    console.log(`📈 Resumen:`);
    console.log(`   - Total colecciones: ${totalCollections}`);
    console.log(`   - Con datos: ${collectionsWithDataCount}`);
    console.log(`   - Vacías: ${totalCollections - collectionsWithDataCount}`);
    
    if (collectionsWithData.length > 0) {
      console.log('\n🗂️  Colecciones con datos:');
      collectionsWithData.forEach(c => {
        console.log(`   - ${c.name}: ${c.count} documentos`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkLocalData();
}

module.exports = { checkLocalData };
