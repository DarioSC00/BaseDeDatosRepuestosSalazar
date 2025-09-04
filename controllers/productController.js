const Product = require('../models/Product');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      category,
      brand,
      size,
      quantity,
      stock,
      price,
      expiration_date // NO pongas estado aquí
    } = req.body;

    const product = new Product({
      code,
      name,
      description,
      category,
      brand,
      size,
      quantity,
      stock,
      price,
      expiration_date
      // NO pongas estado aquí, el modelo lo pone en ACTIVO por defecto
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
  // Si se pasa ?estado=ACTIVO o ?estado=INACTIVO, filtramos por ese estado.
  // Si no se pasa, devolvemos todos los productos (activos e inactivos).
  const { estado } = req.query;
  const filter = estado ? { estado } : {};
  const products = await Product.find(filter).populate('category');
  res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier');
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      category,
      brand,
      size,
      quantity,
      stock,
      price,
      estado, // <-- usa "estado" aquí
      expiration_date
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        code,
        name,
        description,
        category,
        brand,
        size,
        quantity,
        stock,
        price,
        estado, // <-- ahora sí está definido
        expiration_date
      },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado del producto
exports.changeProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    product.estado = req.body.estado; // y el frontend manda { estado: "ACTIVO" }
    await product.save();
    res.json({ msg: 'Estado actualizado', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const columns = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  { key: "price", label: "Precio" }
];

