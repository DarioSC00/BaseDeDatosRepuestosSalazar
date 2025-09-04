const mongoose = require('mongoose');
const Product = require('../../models/Product');

const products = [
    {
        name: 'Product 1',
        description: 'Description for Product 1',
        price: 10.99,
        category: 'Category 1',
        stock: 100
    },
    {
        name: 'Product 2',
        description: 'Description for Product 2',
        price: 15.99,
        category: 'Category 2',
        stock: 50
    },
    {
        name: 'Product 3',
        description: 'Description for Product 3',
        price: 20.99,
        category: 'Category 1',
        stock: 75
    },
    {
        name: 'Product 4',
        description: 'Description for Product 4',
        price: 25.99,
        category: 'Category 3',
        stock: 30
    },
    {
        name: 'Product 5',
        description: 'Description for Product 5',
        price: 30.99,
        category: 'Category 2',
        stock: 20
    }
];

const populateProducts = async (uri) => {
    const connectUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_basededatos';
    try {
        await mongoose.connect(connectUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await Product.deleteMany(); // Limpiar productos existentes
        await Product.insertMany(products); // Insertar nuevos productos

        console.log('Products populated successfully!');
    } catch (error) {
        console.error('Error populating products:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
    }
};

module.exports = populateProducts;

if (require.main === module) {
    // ejecutar desde CLI: node populateProducts.js
    require('dotenv').config();
    populateProducts(process.env.MONGODB_URI).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
