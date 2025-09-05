require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Rutas de dashboard
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Rutas de fertilizantes
const fertilizerRoutes = require('./routes/fertilizerRoutes');
app.use('/api/fertilizantes', fertilizerRoutes);
// Rutas de detalles de compra
const shoppingDetailRoutes = require('./routes/shoppingDetailRoutes');
app.use('/api/detalles-compra', shoppingDetailRoutes);
// Rutas de detalles de venta
const saleDetailRoutes = require('./routes/saleDetailRoutes');
app.use('/api/detalles-venta', saleDetailRoutes);
// Rutas de estados
const statusRoutes = require('./routes/statusRoutes');
app.use('/api/estados', statusRoutes);
// Rutas de categorías
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categorias', categoryRoutes);
// Rutas de productos
const productRoutes = require('./routes/productRoutes');
app.use('/api/productos', productRoutes);
// Rutas de proveedores
const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/proveedores', supplierRoutes);
// Rutas de créditos
const creditRoutes = require('./routes/creditRoutes');
app.use('/api/creditos', creditRoutes);
// Rutas de ventas
app.use('/api/ventas', require('./routes/saleRoutes'));
// Rutas de devoluciones
const devolutionRoutes = require('./routes/devolutionRoutes');
app.use('/api/devoluciones', devolutionRoutes);
// Rutas de compras
const shoppingRoutes = require('./routes/shoppingRoutes');
app.use('/api/compras', shoppingRoutes);
// Rutas de usuarios
const userRoutes = require('./routes/userRoutes');
app.use('/api/usuarios', userRoutes);
// Rutas de roles y permisos
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

// Rutas de detalles de crédito
const creditDetailRoutes = require('./routes/creditDetailRoutes');
app.use('/api/detalles-credito', creditDetailRoutes);
// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// Rutas de clientes
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clientes', clientRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Repuestos Salazar funcionando');
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

// Si este archivo es ejecutado directamente, iniciar el servidor.
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
