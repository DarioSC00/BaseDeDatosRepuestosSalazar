require('dotenv').config();
const mongoose = require('mongoose');

const verifyCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔍 Verificando colecciones en MongoDB Atlas');
    console.log('==========================================');
    
    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log(`📁 Total colecciones: ${collectionNames.length}\n`);
    
    // Colecciones esperadas según tu lista
    const expectedCollections = [
      'categories',
      'clients', 
      'counters',
      'credits',
      'creditdetails', 
      'creditnews', // Este es el equivalente a creditcupos
      'dashboards',
      'dashboarddetails',
      'devolutions',
      'devolutiondetails',
      'fertilizers',
      'notifications',
      'notificationdetails',
      'permissions',
      'products',
      'roles',
      'sales',
      'saledetails', 
      'shoppings',
      'shoppingdetails',
      'status',
      'suppliers',
      'users'
    ];
    
    console.log('✅ Colecciones encontradas:');
    collectionNames.forEach((name, index) => {
      const isExpected = expectedCollections.includes(name);
      const icon = isExpected ? '✅' : '❓';
      console.log(`   ${icon} ${index + 1}. ${name}`);
    });
    
    console.log('\n📊 Verificación de colecciones esperadas:');
    expectedCollections.forEach(expected => {
      const exists = collectionNames.includes(expected);
      const icon = exists ? '✅' : '❌';
      console.log(`   ${icon} ${expected}`);
    });
    
    // Colecciones faltantes
    const missing = expectedCollections.filter(expected => !collectionNames.includes(expected));
    if (missing.length > 0) {
      console.log('\n❌ Colecciones faltantes:');
      missing.forEach(m => console.log(`   - ${m}`));
    } else {
      console.log('\n🎉 ¡Todas las colecciones esperadas están presentes!');
    }
    
    // Colecciones extra
    const extra = collectionNames.filter(actual => !expectedCollections.includes(actual));
    if (extra.length > 0) {
      console.log('\n➕ Colecciones adicionales encontradas:');
      extra.forEach(e => console.log(`   + ${e}`));
    }
    
    console.log('\n==========================================');
    console.log(`📈 Resumen:`);
    console.log(`   - Colecciones totales: ${collectionNames.length}`);
    console.log(`   - Colecciones esperadas: ${expectedCollections.length}`);
    console.log(`   - Colecciones faltantes: ${missing.length}`);
    console.log(`   - Colecciones adicionales: ${extra.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
};

verifyCollections();
