require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

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

// Categorías para repuestos de motos y carros
const categories = [
  {
    name: "Motor",
    description: "Repuestos y componentes del sistema motor",
    status: "ACTIVO"
  },
  {
    name: "Frenos",
    description: "Sistema de frenos, pastillas, discos y componentes",
    status: "ACTIVO"
  },
  {
    name: "Suspensión",
    description: "Amortiguadores, muelles y componentes de suspensión",
    status: "ACTIVO"
  },
  {
    name: "Transmisión",
    description: "Clutch, cadenas, piñones y componentes de transmisión",
    status: "ACTIVO"
  },
  {
    name: "Eléctrico",
    description: "Sistema eléctrico, baterías, luces y componentes",
    status: "ACTIVO"
  },
  {
    name: "Carrocería",
    description: "Espejos, faros, defensas y accesorios de carrocería",
    status: "ACTIVO"
  },
  {
    name: "Llantas y Rines",
    description: "Llantas, rines y accesorios para ruedas",
    status: "ACTIVO"
  },
  {
    name: "Filtros",
    description: "Filtros de aire, aceite, combustible y cabina",
    status: "ACTIVO"
  },
  {
    name: "Lubricantes",
    description: "Aceites, grasas y lubricantes para motor y transmisión",
    status: "ACTIVO"
  },
  {
    name: "Accesorios",
    description: "Cascos, guantes, herramientas y accesorios varios",
    status: "ACTIVO"
  }
];

// Función para calcular precios automáticamente
const calculatePrices = (purchasePrice, wholesaleMargin = 20, retailMargin = 25) => {
  const priceWholesale = purchasePrice * (1 + wholesaleMargin / 100);
  const priceRetail = purchasePrice * (1 + retailMargin / 100);
  
  return {
    price_purchase: purchasePrice,
    price_wholesale: Math.round(priceWholesale),
    price_retail: Math.round(priceRetail),
    price: Math.round(priceRetail), // precio principal es el retail
    margin_wholesale: wholesaleMargin,
    margin_retail: retailMargin
  };
};

// Productos organizados por categoría
const getProductsByCategory = (categoryIds) => {
  return [
    // MOTOR
    {
      code: "MOT001",
      name: "Aceite Motor 20W-50 Castrol",
      description: "Aceite multigrado para motor de moto y carro, excelente protección",
      category: categoryIds["Motor"],
      brand: "Castrol",
      size: "1 Litro",
      quantity: 1,
      stock: 50,
      estado: "ACTIVO",
      ...calculatePrices(25000, 25, 30)
    },
    {
      code: "MOT002",
      name: "Bujía NGK para Moto 150cc",
      description: "Bujía estándar para motocicletas 150cc, alta durabilidad",
      category: categoryIds["Motor"],
      brand: "NGK",
      size: "Estándar",
      quantity: 1,
      stock: 100,
      estado: "ACTIVO",
      ...calculatePrices(12000, 30, 35)
    },
    {
      code: "MOT003",
      name: "Filtro de Aire K&N",
      description: "Filtro de aire deportivo reutilizable para mayor rendimiento",
      category: categoryIds["Motor"],
      brand: "K&N",
      size: "Universal",
      quantity: 1,
      stock: 25,
      estado: "ACTIVO",
      ...calculatePrices(85000, 20, 25)
    },
    {
      code: "MOT004",
      name: "Kit de Empaquduras Motor 150cc",
      description: "Kit completo de empaquetaduras para motor 150cc",
      category: categoryIds["Motor"],
      brand: "Genuine Parts",
      size: "150cc",
      quantity: 1,
      stock: 15,
      estado: "ACTIVO",
      ...calculatePrices(45000, 25, 30)
    },

    // FRENOS
    {
      code: "FRE001",
      name: "Pastillas de Freno Delanteras Moto",
      description: "Pastillas de freno cerámicas para mejor frenado",
      category: categoryIds["Frenos"],
      brand: "Brembo",
      size: "Estándar",
      quantity: 1,
      stock: 40,
      estado: "ACTIVO",
      ...calculatePrices(35000, 25, 30)
    },
    {
      code: "FRE002",
      name: "Disco de Freno Delantero 260mm",
      description: "Disco de freno ventilado para moto deportiva",
      category: categoryIds["Frenos"],
      brand: "EBC",
      size: "260mm",
      quantity: 1,
      stock: 20,
      estado: "ACTIVO",
      ...calculatePrices(120000, 20, 25)
    },
    {
      code: "FRE003",
      name: "Líquido de Frenos DOT 4",
      description: "Líquido de frenos de alta calidad DOT 4",
      category: categoryIds["Frenos"],
      brand: "Motul",
      size: "500ml",
      quantity: 1,
      stock: 30,
      estado: "ACTIVO",
      ...calculatePrices(18000, 30, 35)
    },
    {
      code: "FRE004",
      name: "Cable de Freno Trasero",
      description: "Cable de freno trasero universal para moto",
      category: categoryIds["Frenos"],
      brand: "Motion Pro",
      size: "150cm",
      quantity: 1,
      stock: 25,
      estado: "ACTIVO",
      ...calculatePrices(22000, 25, 30)
    },

    // SUSPENSIÓN
    {
      code: "SUS001",
      name: "Amortiguador Trasero Moto 320mm",
      description: "Amortiguador trasero regulable para moto 150cc-250cc",
      category: categoryIds["Suspensión"],
      brand: "YSS",
      size: "320mm",
      quantity: 1,
      stock: 12,
      estado: "ACTIVO",
      ...calculatePrices(180000, 20, 25)
    },
    {
      code: "SUS002",
      name: "Resorte Horquilla Delantera",
      description: "Resorte para horquilla delantera moto deportiva",
      category: categoryIds["Suspensión"],
      brand: "Progressive",
      size: "Estándar",
      quantity: 1,
      stock: 18,
      estado: "ACTIVO",
      ...calculatePrices(65000, 25, 30)
    },
    {
      code: "SUS003",
      name: "Aceite Horquilla 10W",
      description: "Aceite especial para horquillas delanteras",
      category: categoryIds["Suspensión"],
      brand: "Motul",
      size: "1 Litro",
      quantity: 1,
      stock: 35,
      estado: "ACTIVO",
      ...calculatePrices(32000, 30, 35)
    },

    // TRANSMISIÓN
    {
      code: "TRA001",
      name: "Cadena de Transmisión 428",
      description: "Cadena reforzada para moto 150cc con 120 eslabones",
      category: categoryIds["Transmisión"],
      brand: "DID",
      size: "428-120L",
      quantity: 1,
      stock: 28,
      estado: "ACTIVO",
      ...calculatePrices(55000, 25, 30)
    },
    {
      code: "TRA002",
      name: "Kit Piñón y Corona 428",
      description: "Kit completo piñón 14T y corona 42T",
      category: categoryIds["Transmisión"],
      brand: "JT Sprockets",
      size: "14T/42T",
      quantity: 1,
      stock: 15,
      estado: "ACTIVO",
      ...calculatePrices(85000, 20, 25)
    },
    {
      code: "TRA003",
      name: "Embrague Completo 150cc",
      description: "Kit de embrague completo para moto 150cc",
      category: categoryIds["Transmisión"],
      brand: "Newfren",
      size: "150cc",
      quantity: 1,
      stock: 10,
      estado: "ACTIVO",
      ...calculatePrices(120000, 20, 25)
    },
    {
      code: "TRA004",
      name: "Cable de Embrague",
      description: "Cable de embrague universal regulable",
      category: categoryIds["Transmisión"],
      brand: "Motion Pro",
      size: "Universal",
      quantity: 1,
      stock: 22,
      estado: "ACTIVO",
      ...calculatePrices(28000, 25, 30)
    },

    // ELÉCTRICO
    {
      code: "ELE001",
      name: "Batería 12V 7Ah para Moto",
      description: "Batería de gel libre de mantenimiento",
      category: categoryIds["Eléctrico"],
      brand: "Yuasa",
      size: "12V 7Ah",
      quantity: 1,
      stock: 20,
      estado: "ACTIVO",
      ...calculatePrices(85000, 20, 25)
    },
    {
      code: "ELE002",
      name: "Faro LED 35W H4",
      description: "Faro LED alta luminosidad para moto",
      category: categoryIds["Eléctrico"],
      brand: "Philips",
      size: "H4 35W",
      quantity: 1,
      stock: 30,
      estado: "ACTIVO",
      ...calculatePrices(75000, 25, 30)
    },
    {
      code: "ELE003",
      name: "Regulador de Voltaje",
      description: "Regulador rectificador de voltaje para moto 150cc",
      category: categoryIds["Eléctrico"],
      brand: "Electrosport",
      size: "150cc",
      quantity: 1,
      stock: 15,
      estado: "ACTIVO",
      ...calculatePrices(45000, 25, 30)
    },
    {
      code: "ELE004",
      name: "Kit Luces LED Direccionales",
      description: "Kit completo de direccionales LED para moto",
      category: categoryIds["Eléctrico"],
      brand: "Koso",
      size: "Universal",
      quantity: 1,
      stock: 25,
      estado: "ACTIVO",
      ...calculatePrices(55000, 25, 30)
    },

    // CARROCERÍA
    {
      code: "CAR001",
      name: "Espejo Retrovisor Deportivo",
      description: "Espejo retrovisor aerodinámico para moto deportiva",
      category: categoryIds["Carrocería"],
      brand: "Rizoma",
      size: "Universal",
      quantity: 1,
      stock: 40,
      estado: "ACTIVO",
      ...calculatePrices(65000, 25, 30)
    },
    {
      code: "CAR002",
      name: "Carenaje Lateral Izquierdo",
      description: "Carenaje lateral compatible con moto 150cc",
      category: categoryIds["Carrocería"],
      brand: "OEM",
      size: "150cc",
      quantity: 1,
      stock: 8,
      estado: "ACTIVO",
      ...calculatePrices(120000, 20, 25)
    },
    {
      code: "CAR003",
      name: "Parabrisas Deportivo",
      description: "Parabrisas ahumado para moto naked",
      category: categoryIds["Carrocería"],
      brand: "Puig",
      size: "Universal",
      quantity: 1,
      stock: 12,
      estado: "ACTIVO",
      ...calculatePrices(95000, 25, 30)
    },

    // LLANTAS Y RINES
    {
      code: "LLA001",
      name: "Llanta Trasera 140/70-17",
      description: "Llanta deportiva para moto con excelente agarre",
      category: categoryIds["Llantas y Rines"],
      brand: "Michelin",
      size: "140/70-17",
      quantity: 1,
      stock: 15,
      estado: "ACTIVO",
      ...calculatePrices(220000, 20, 25)
    },
    {
      code: "LLA002",
      name: "Llanta Delantera 110/70-17",
      description: "Llanta delantera deportiva para alto rendimiento",
      category: categoryIds["Llantas y Rines"],
      brand: "Pirelli",
      size: "110/70-17",
      quantity: 1,
      stock: 18,
      estado: "ACTIVO",
      ...calculatePrices(195000, 20, 25)
    },
    {
      code: "LLA003",
      name: "Rin Delantero 17x3.5",
      description: "Rin de aluminio forjado para moto deportiva",
      category: categoryIds["Llantas y Rines"],
      brand: "Marchesini",
      size: "17x3.5",
      quantity: 1,
      stock: 6,
      estado: "ACTIVO",
      ...calculatePrices(450000, 15, 20)
    },
    {
      code: "LLA004",
      name: "Válvulas de Llanta Deportivas",
      description: "Válvulas CNC anodizadas para llanta tubeless",
      category: categoryIds["Llantas y Rines"],
      brand: "Pro Bolt",
      size: "Universal",
      quantity: 1,
      stock: 50,
      estado: "ACTIVO",
      ...calculatePrices(15000, 30, 35)
    },

    // FILTROS
    {
      code: "FIL001",
      name: "Filtro de Aceite Moto 150cc",
      description: "Filtro de aceite de alta eficiencia",
      category: categoryIds["Filtros"],
      brand: "Hiflo",
      size: "150cc",
      quantity: 1,
      stock: 60,
      estado: "ACTIVO",
      ...calculatePrices(18000, 30, 35)
    },
    {
      code: "FIL002",
      name: "Filtro de Gasolina Universal",
      description: "Filtro de combustible transparente universal",
      category: categoryIds["Filtros"],
      brand: "WIX",
      size: "6mm",
      quantity: 1,
      stock: 45,
      estado: "ACTIVO",
      ...calculatePrices(12000, 35, 40)
    },
    {
      code: "FIL003",
      name: "Filtro de Aire K&N Lavable",
      description: "Filtro de aire de alto flujo lavable y reutilizable",
      category: categoryIds["Filtros"],
      brand: "K&N",
      size: "Universal",
      quantity: 1,
      stock: 20,
      estado: "ACTIVO",
      ...calculatePrices(95000, 20, 25)
    },

    // LUBRICANTES
    {
      code: "LUB001",
      name: "Aceite Sintético 10W-40 Motul",
      description: "Aceite sintético de alta gama para moto 4 tiempos",
      category: categoryIds["Lubricantes"],
      brand: "Motul",
      size: "1 Litro",
      quantity: 1,
      stock: 35,
      estado: "ACTIVO",
      ...calculatePrices(45000, 25, 30)
    },
    {
      code: "LUB002",
      name: "Grasa Multiusos Cadena",
      description: "Grasa especial para cadena de transmisión",
      category: categoryIds["Lubricantes"],
      brand: "Motul",
      size: "400ml",
      quantity: 1,
      stock: 40,
      estado: "ACTIVO",
      ...calculatePrices(22000, 30, 35)
    },
    {
      code: "LUB003",
      name: "Aceite Horquilla SAE 10",
      description: "Aceite especial para horquillas telescópicas",
      category: categoryIds["Lubricantes"],
      brand: "Castrol",
      size: "500ml",
      quantity: 1,
      stock: 25,
      estado: "ACTIVO",
      ...calculatePrices(28000, 25, 30)
    },

    // ACCESORIOS
    {
      code: "ACC001",
      name: "Casco Integral Deportivo",
      description: "Casco integral con visor antivaho y ventilación",
      category: categoryIds["Accesorios"],
      brand: "HJC",
      size: "M",
      quantity: 1,
      stock: 15,
      estado: "ACTIVO",
      ...calculatePrices(180000, 20, 25)
    },
    {
      code: "ACC002",
      name: "Guantes de Cuero Racing",
      description: "Guantes de cuero con protecciones de nudillos",
      category: categoryIds["Accesorios"],
      brand: "Alpinestars",
      size: "L",
      quantity: 1,
      stock: 25,
      estado: "ACTIVO",
      ...calculatePrices(95000, 25, 30)
    },
    {
      code: "ACC003",
      name: "Kit Herramientas Moto",
      description: "Kit completo de herramientas para moto en estuche",
      category: categoryIds["Accesorios"],
      brand: "Motion Pro",
      size: "Universal",
      quantity: 1,
      stock: 12,
      estado: "ACTIVO",
      ...calculatePrices(85000, 25, 30)
    },
    {
      code: "ACC004",
      name: "Candado Disco con Alarma",
      description: "Candado de disco con alarma de 110dB",
      category: categoryIds["Accesorios"],
      brand: "Xena",
      size: "6mm",
      quantity: 1,
      stock: 20,
      estado: "ACTIVO",
      ...calculatePrices(75000, 25, 30)
    },
    {
      code: "ACC005",
      name: "Soporte Celular Moto",
      description: "Soporte universal para celular resistente al agua",
      category: categoryIds["Accesorios"],
      brand: "Ram Mount",
      size: "Universal",
      quantity: 1,
      stock: 30,
      estado: "ACTIVO",
      ...calculatePrices(45000, 30, 35)
    }
  ];
};

// Función para insertar categorías
const insertCategories = async () => {
  try {
    console.log('🏷️  Insertando categorías...');
    
    // Limpiar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️  Categorías anteriores eliminadas');
    
    // Insertar nuevas categorías
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ ${insertedCategories.length} categorías insertadas exitosamente`);
    
    // Crear mapeo de categorías por nombre
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    return categoryMap;
  } catch (error) {
    console.error('❌ Error insertando categorías:', error);
    throw error;
  }
};

// Función para insertar productos
const insertProducts = async (categoryIds) => {
  try {
    console.log('📦 Insertando productos...');
    
    // Limpiar productos existentes
    await Product.deleteMany({});
    console.log('🗑️  Productos anteriores eliminados');
    
    // Obtener productos con las categorías correctas
    const products = getProductsByCategory(categoryIds);
    
    // Insertar productos
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} productos insertados exitosamente`);
    
    return insertedProducts;
  } catch (error) {
    console.error('❌ Error insertando productos:', error);
    throw error;
  }
};

// Función principal
const seedDatabase = async () => {
  try {
    console.log('🚀 Iniciando proceso de seed para Ferretería Salazar');
    console.log('================================================');
    
    // Conectar a la base de datos
    await connectDB();
    
    // Insertar categorías
    const categoryIds = await insertCategories();
    
    // Insertar productos
    await insertProducts(categoryIds);
    
    console.log('================================================');
    console.log('🎉 Proceso de seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${categories.length} categorías insertadas`);
    console.log(`   - ${getProductsByCategory(categoryIds).length} productos insertados`);
    console.log('================================================');
    
  } catch (error) {
    console.error('💥 Error en el proceso de seed:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
