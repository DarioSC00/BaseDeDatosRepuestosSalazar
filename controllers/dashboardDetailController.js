const DashboardDetail = require('../models/DashboardDetail');

// Obtener dashboard detail por periodo y tipo
exports.getDashboardDetail = async (req, res) => {
  try {
    const { period, type } = req.query;
    const detail = await DashboardDetail.findOne({ period, type });
    if (!detail) return res.status(404).json({ error: 'No hay datos para ese periodo' });
    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear o actualizar dashboard detail (para uso de jobs o admin)
exports.upsertDashboardDetail = async (req, res) => {
  try {
    const { period, type, total_sales, total_purchases, total_profit, top_products, least_sold_products } = req.body;
    const detail = await DashboardDetail.findOneAndUpdate(
      { period, type },
      { $set: { total_sales, total_purchases, total_profit, top_products, least_sold_products } },
      { upsert: true, new: true }
    );
    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
