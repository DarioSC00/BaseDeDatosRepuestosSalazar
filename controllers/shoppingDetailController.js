const ShoppingDetail = require('../models/ShoppingDetail');

// Crear un nuevo detalle de compra
exports.createShoppingDetail = async (req, res) => {
  try {
    const shoppingDetail = new ShoppingDetail(req.body);
    await shoppingDetail.save();
    res.status(201).json(shoppingDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los detalles de compra
exports.getShoppingDetails = async (req, res) => {
  try {
    const shoppingDetails = await ShoppingDetail.find().populate('product').populate('shopping');
    res.json(shoppingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener detalles por ID de compra (shopping)
exports.getDetailsByShopping = async (req, res) => {
  try {
    const shoppingId = req.params.shoppingId;
    if (!shoppingId) return res.status(400).json({ error: 'shoppingId es requerido' });
    const details = await ShoppingDetail.find({ shopping: shoppingId }).populate('product');
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un detalle de compra por ID
exports.getShoppingDetailById = async (req, res) => {
  try {
    const shoppingDetail = await ShoppingDetail.findById(req.params.id).populate('product').populate('shopping');
    if (!shoppingDetail) return res.status(404).json({ error: 'Detalle de compra no encontrado' });
    res.json(shoppingDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un detalle de compra
exports.updateShoppingDetail = async (req, res) => {
  try {
    const shoppingDetail = await ShoppingDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shoppingDetail) return res.status(404).json({ error: 'Detalle de compra no encontrado' });
    res.json(shoppingDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un detalle de compra
exports.deleteShoppingDetail = async (req, res) => {
  try {
    const shoppingDetail = await ShoppingDetail.findByIdAndDelete(req.params.id);
    if (!shoppingDetail) return res.status(404).json({ error: 'Detalle de compra no encontrado' });
    res.json({ message: 'Detalle de compra eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
