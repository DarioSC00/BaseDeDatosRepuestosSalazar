const Category = require('../models/Category');

// Crear categoría
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validación básica
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: "El nombre es obligatorio y debe tener al menos 3 caracteres" });
    }

    // Crear la categoría (status por defecto es ACTIVO si no se envía)
    const category = new Category({
      name,
      description,
      status: status || 'ACTIVO'
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una categoría
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado de una categoría
exports.changeCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    category.status = category.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    await category.save();

    res.json({ message: 'Estado actualizado', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
