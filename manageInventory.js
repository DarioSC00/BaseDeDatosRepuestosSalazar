require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};

// Función para actualizar stock aleatorio
const updateProductStock = async () => {
  try {
    console.log('📊 Actualizando stock de productos...');
    
    const products = await Product.find({ estado: 'ACTIVO' });
    
    for (const product of products) {
      // Generar stock aleatorio entre 5 y 100
      const newStock = Math.floor(Math.random() * 96) + 5;
      
      // Actualizar el producto
      await Product.findByIdAndUpdate(product._id, {
        stock: newStock
      });
      
      console.log(`📦 ${product.name} - Stock actualizado a: ${newStock}`);
    }
    
    console.log(`✅ Stock actualizado para ${products.length} productos`);
    
  } catch (error) {
    console.error('❌ Error actualizando stock:', error);
    throw error;
  }
};

// Función para ajustar precios con inflación
const adjustPricesInflation = async (inflationPercent = 5) => {
  try {
    console.log(`💰 Aplicando ajuste de precios del ${inflationPercent}%...`);
    
    const products = await Product.find({ estado: 'ACTIVO' });
    
    for (const product of products) {
      const multiplier = 1 + (inflationPercent / 100);
      
      const newPricePurchase = Math.round(product.price_purchase * multiplier);
      const newPriceWholesale = Math.round(product.price_wholesale * multiplier);
      const newPriceRetail = Math.round(product.price_retail * multiplier);
      
      await Product.findByIdAndUpdate(product._id, {
        price_purchase: newPricePurchase,
        price_wholesale: newPriceWholesale,
        price_retail: newPriceRetail,
        price: newPriceRetail
      });
      
      console.log(`💵 ${product.name} - Precio retail: $${product.price_retail} → $${newPriceRetail}`);
    }
    
    console.log(`✅ Precios ajustados para ${products.length} productos`);
    
  } catch (error) {
    console.error('❌ Error ajustando precios:', error);
    throw error;
  }
};

// Función para mostrar estadísticas
const showStatistics = async () => {
  try {
    console.log('📈 Generando estadísticas...');
    console.log('============================');
    
    const totalProducts = await Product.countDocuments({ estado: 'ACTIVO' });
    const lowStock = await Product.countDocuments({ estado: 'ACTIVO', stock: { $lt: 10 } });
    const outOfStock = await Product.countDocuments({ estado: 'ACTIVO', stock: 0 });
    
    // Estadísticas por categoría
    const categoryStats = await Product.aggregate([
      { $match: { estado: 'ACTIVO' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price_retail' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Productos más caros
    const expensiveProducts = await Product.find({ estado: 'ACTIVO' })
      .sort({ price_retail: -1 })
      .limit(5)
      .populate('category', 'name');
    
    // Productos con mayor stock
    const highestStock = await Product.find({ estado: 'ACTIVO' })
      .sort({ stock: -1 })
      .limit(5)
      .populate('category', 'name');
    
    console.log(`📦 Total de productos activos: ${totalProducts}`);
    console.log(`⚠️  Productos con stock bajo (<10): ${lowStock}`);
    console.log(`🚫 Productos sin stock: ${outOfStock}`);
    console.log('');
    
    console.log('📊 Productos por categoría:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} productos, Stock total: ${stat.totalStock}, Precio promedio: $${Math.round(stat.avgPrice)}`);
    });
    console.log('');
    
    console.log('💎 Top 5 productos más caros:');
    expensiveProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category.name}) - $${product.price_retail}`);
    });
    console.log('');
    
    console.log('📈 Top 5 productos con mayor stock:');
    highestStock.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category.name}) - Stock: ${product.stock}`);
    });
    
  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
    throw error;
  }
};

// Función principal
const manageInventory = async () => {
  try {
    console.log('🛠️  Gestor de Inventario - Ferretería Salazar');
    console.log('============================================');
    
    await connectDB();
    
    // Obtener argumentos de la línea de comandos
    const args = process.argv.slice(2);
    const action = args[0];
    
    switch (action) {
      case 'stock':
        await updateProductStock();
        break;
      case 'prices':
        const inflation = args[1] ? parseFloat(args[1]) : 5;
        await adjustPricesInflation(inflation);
        break;
      case 'stats':
        await showStatistics();
        break;
      case 'all':
        await updateProductStock();
        await adjustPricesInflation(5);
        await showStatistics();
        break;
      default:
        console.log('📋 Uso del script:');
        console.log('   node manageInventory.js stock          - Actualizar stock aleatorio');
        console.log('   node manageInventory.js prices [%]     - Ajustar precios (default 5%)');
        console.log('   node manageInventory.js stats          - Mostrar estadísticas');
        console.log('   node manageInventory.js all            - Ejecutar todas las opciones');
        console.log('');
        console.log('📊 Ejecutando estadísticas por defecto...');
        await showStatistics();
        break;
    }
    
  } catch (error) {
    console.error('💥 Error en el gestor de inventario:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
if (require.main === module) {
  manageInventory();
}

module.exports = { updateProductStock, adjustPricesInflation, showStatistics };
