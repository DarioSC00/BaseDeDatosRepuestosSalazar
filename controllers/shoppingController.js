const Shopping = require('../models/Shopping');
const ShoppingDetail = require('../models/ShoppingDetail');
const Product = require('../models/Product');

// Crear una nueva compra y actualizar stock
exports.createShopping = async (req, res) => {
  try {
  let { details, supplier, code, total_value, observations, user } = req.body;
  // Limpieza automática del código
  if (code) code = code.trim().toUpperCase();
    // Validaciones obligatorias
    if (!supplier) return res.status(400).json({ error: 'El proveedor es obligatorio.' });
    if (!code) return res.status(400).json({ error: 'El código de compra es obligatorio.' });
    if (!user) return res.status(400).json({ error: 'El usuario es obligatorio.' });
    if (!observations) return res.status(400).json({ error: 'Las observaciones son obligatorias.' });
    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ error: 'Debe agregar al menos un producto a la compra.' });
    }

    let total_value_calc = 0;
    const shopping = new Shopping({ ...req.body, total_value: 0 });
    await shopping.save();

    for (const item of details) {
      const total_price = (item.count && item.unit_price) ? item.count * item.unit_price : 0;
      total_value_calc += total_price;
      let product = await Product.findOne({ code: item.code });
      if (product) {
        // Si existe, actualiza stock y precio
        product.stock += item.count;
        product.price = item.sale_price;
        await product.save();
      } else {
        // Si no existe, crea nuevo producto
        product = new Product({
          code: item.code,
          name: item.name,
          description: item.description || '',
          category: item.category,
          brand: item.brand,
          size: item.size || '',
          quantity: item.quantity || 1,
          stock: item.count,
          price: item.sale_price,
          expiration_date: item.expiration_date || null
        });
        await product.save();
      }
      // Crear el detalle de compra
      const detailData = { ...item, shopping: shopping._id, product: product._id, total_price };
      const detail = new ShoppingDetail(detailData);
      await detail.save();
    }

    // Actualizar el total_value en la compra
    shopping.total_value = total_value_calc;
    await shopping.save();

    res.status(201).json(shopping);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todas las compras con detalles y productos
exports.getShoppings = async (req, res) => {
  try {
    // Trae las compras con proveedor y usuario
    const shoppings = await Shopping.find()
      .populate({ path: 'supplier', select: 'full_name company_name document phone email' })
      .populate({ path: 'user', select: 'full_name email' })
      .sort({ createdAt: -1 });

    // Para cada compra, trae sus detalles y popula el producto
    const shoppingsWithDetails = await Promise.all(
      shoppings.map(async (shopping) => {
        const details = await ShoppingDetail.find({ shopping: shopping._id }).populate('product');
        const shoppingObj = shopping.toObject();
        shoppingObj.details = details;
        return shoppingObj;
      })
    );

    // Devuelve todas las compras, tengan o no detalles
    res.json(shoppingsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una compra por ID
exports.getShoppingById = async (req, res) => {
  try {
    const shopping = await Shopping.findById(req.params.id).populate('supplier').populate('user');
    if (!shopping) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(shopping);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una compra
exports.updateShopping = async (req, res) => {
  try {
    const shopping = await Shopping.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shopping) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(shopping);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una compra
exports.deleteShopping = async (req, res) => {
  try {
    const shopping = await Shopping.findByIdAndDelete(req.params.id);
    if (!shopping) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json({ message: 'Compra eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

