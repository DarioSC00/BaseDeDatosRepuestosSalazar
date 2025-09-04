const SaleDetail = require('../models/SaleDetail');

// Crear un nuevo detalle de venta
exports.createSaleDetail = async (req, res) => {
  try {
    const saleDetail = new SaleDetail(req.body);
    await saleDetail.save();
    res.status(201).json(saleDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los detalles de venta
exports.getSaleDetails = async (req, res) => {
  try {
    const saleDetails = await SaleDetail.find().populate('sale').populate('product');
    res.json(saleDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un detalle de venta por ID
exports.getSaleDetailById = async (req, res) => {
  try {
    const saleDetail = await SaleDetail.findById(req.params.id).populate('sale').populate('product');
    if (!saleDetail) return res.status(404).json({ error: 'Detalle de venta no encontrado' });
    res.json(saleDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un detalle de venta
exports.updateSaleDetail = async (req, res) => {
  try {
    const saleDetail = await SaleDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!saleDetail) return res.status(404).json({ error: 'Detalle de venta no encontrado' });
    res.json(saleDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un detalle de venta
exports.deleteSaleDetail = async (req, res) => {
  try {
    const saleDetail = await SaleDetail.findByIdAndDelete(req.params.id);
    if (!saleDetail) return res.status(404).json({ error: 'Detalle de venta no encontrado' });
    res.json({ message: 'Detalle de venta eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
