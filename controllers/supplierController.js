const Supplier = require('../models/Supplier');

// Crear un nuevo proveedor
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los proveedores
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un proveedor por ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(supplier); // Debe retornar el objeto completo
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

// Actualizar un proveedor
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un proveedor
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado de un proveedor
exports.cambiarEstadoProveedor = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    supplier.status = supplier.status === 'activo' ? 'inactivo' : 'activo';
    await supplier.save();

    res.json({ msg: 'Estado actualizado', supplier });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado', details: error.message });
  }
};
