const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Product = require('../models/Product');

describe('Product API', () => {
  afterAll(async () => {
    // limpiar y desconectar
    await mongoose.connection.db.dropDatabase();
    if (global.__MONGOD__ && global.__MONGOD__.stop) await global.__MONGOD__.stop();
  });

  test('POST /api/productos - crear producto válido', async () => {
    // Para category necesitamos un ObjectId válido; usar uno nuevo
    const categoryId = new mongoose.Types.ObjectId();
    const productData = {
      code: 'ABC123',
      name: 'Prueba Producto',
      description: 'Descripción de prueba',
      category: categoryId,
      brand: 'MarcaX',
      quantity: 10,
      stock: 5,
      price: 100,
      price_purchase: 60,
      price_wholesale: 80,
      price_retail: 100
    };

    const res = await request(app).post('/api/productos').send(productData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(productData.name);
  });

  test('GET /api/productos - listar productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('DELETE /api/productos/:id - eliminar producto', async () => {
    const product = await Product.findOne({ code: 'ABC123' });
    const res = await request(app).delete(`/api/productos/${product._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
