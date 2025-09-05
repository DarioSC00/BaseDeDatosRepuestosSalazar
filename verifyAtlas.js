require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Permission = require('./models/Permission');
const Role = require('./models/Role');

const verifyAtlas = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB Atlas');
    
    const results = await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Permission.countDocuments(),
      Role.countDocuments()
    ]);
    
    console.log('📊 Estado en Atlas:');
    console.log(`   - Categorías: ${results[0]}`);
    console.log(`   - Productos: ${results[1]}`);
    console.log(`   - Usuarios: ${results[2]}`);
    console.log(`   - Permisos: ${results[3]}`);
    console.log(`   - Roles: ${results[4]}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAtlas();
