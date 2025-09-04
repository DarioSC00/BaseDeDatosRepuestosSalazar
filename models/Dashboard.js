// Este modelo no almacena datos, pero define funciones estáticas para reportes agregados

const mongoose = require('mongoose');
const Sale = require('./Sale');
const Shopping = require('./Shopping');
const Product = require('./Product');
const Category = require('./Category');

const DashboardSchema = new mongoose.Schema({}, { strict: false });

// Productos menos vendidos con filtros de fecha
DashboardSchema.statics.topLeastSoldProducts = function(limit = 3, { year, month, day } = {}) {
  const SaleDetail = mongoose.model('SaleDetail');
  
  let dateFilter = {};
  if (year) {
    dateFilter.$gte = new Date(`${year}-01-01`);
    dateFilter.$lte = new Date(`${year}-12-31T23:59:59.999Z`);
    if (month) {
      const m = String(month).padStart(2, '0');
      dateFilter.$gte = new Date(`${year}-${m}-01`);
      dateFilter.$lte = new Date(`${year}-${m}-31T23:59:59.999Z`);
      if (day) {
        const d = String(day).padStart(2, '0');
        dateFilter.$gte = new Date(`${year}-${m}-${d}T00:00:00.000Z`);
        dateFilter.$lte = new Date(`${year}-${m}-${d}T23:59:59.999Z`);
      }
    }
  }

  const pipeline = [
    { $lookup: {
        from: "sales",
        localField: "sale",
        foreignField: "_id",
        as: "sale"
      }
    },
    { $unwind: "$sale" }
  ];

  if (Object.keys(dateFilter).length) {
    pipeline.push({
      $match: {
        $or: [
          { "sale.created_at": dateFilter },
          { "sale.createdAt": dateFilter }
        ]
      }
    });
  }

  pipeline.push(
    { $group: {
        _id: "$product",
        quantity: { $sum: "$count" }
      }
    },
    { $sort: { quantity: 1 } },
    { $limit: limit },
    { $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    { $project: { _id: 0, name: "$product.name", quantity: 1 } }
  );

  return SaleDetail.aggregate(pipeline);
};


// Reporte de ventas por mes, año o día

DashboardSchema.statics.salesByPeriod = function({ year, month, day } = {}) {
  const SaleDetail = mongoose.model('SaleDetail');
  let dateFilter = {};
  if (year) {
    dateFilter.$gte = new Date(`${year}-01-01`);
    dateFilter.$lte = new Date(`${year}-12-31T23:59:59.999Z`);
    if (month) {
      const m = String(month).padStart(2, '0');
      dateFilter.$gte = new Date(`${year}-${m}-01`);
      dateFilter.$lte = new Date(`${year}-${m}-31T23:59:59.999Z`);
      if (day) {
        const d = String(day).padStart(2, '0');
        dateFilter.$gte = new Date(`${year}-${m}-${d}T00:00:00.000Z`);
        dateFilter.$lte = new Date(`${year}-${m}-${d}T23:59:59.999Z`);
      }
    }
  }
  let format = "%Y-%m";
  if (day) format = "%Y-%m-%d";
  else if (month) format = "%Y-%m";
  else if (year) format = "%Y";
  const pipeline = [
    { $lookup: {
        from: "sales",
        localField: "sale",
        foreignField: "_id",
        as: "sale"
      }
    },
    { $unwind: "$sale" },
  ];
  if (Object.keys(dateFilter).length) {
    pipeline.push({
      $match: {
        $or: [
          { "sale.created_at": dateFilter },
          { "sale.createdAt": dateFilter }
        ]
      }
    });
  }
  pipeline.push({
    $group: {
      _id: {
        $dateToString: {
          format,
          date: {
            $ifNull: ["$sale.created_at", "$sale.createdAt"]
          }
        }
      },
      total: { $sum: "$total_price" },
      count: { $sum: "$count" }
    }
  });
  pipeline.push({ $sort: { _id: 1 } });
  return SaleDetail.aggregate(pipeline);
};

// Reporte de compras por mes, año o día

DashboardSchema.statics.purchasesByPeriod = function({ year, month, day } = {}) {
  const ShoppingDetail = mongoose.model('ShoppingDetail');
  let dateFilter = {};
  if (year) {
    dateFilter.$gte = new Date(`${year}-01-01`);
    dateFilter.$lte = new Date(`${year}-12-31T23:59:59.999Z`);
    if (month) {
      const m = String(month).padStart(2, '0');
      dateFilter.$gte = new Date(`${year}-${m}-01`);
      dateFilter.$lte = new Date(`${year}-${m}-31T23:59:59.999Z`);
      if (day) {
        const d = String(day).padStart(2, '0');
        dateFilter.$gte = new Date(`${year}-${m}-${d}T00:00:00.000Z`);
        dateFilter.$lte = new Date(`${year}-${m}-${d}T23:59:59.999Z`);
      }
    }
  }
  let format = "%Y-%m";
  if (day) format = "%Y-%m-%d";
  else if (month) format = "%Y-%m";
  else if (year) format = "%Y";
  const pipeline = [
    { $lookup: {
        from: "shoppings",
        localField: "shopping",
        foreignField: "_id",
        as: "shopping"
      }
    },
    { $unwind: "$shopping" },
  ];
  if (Object.keys(dateFilter).length) {
    pipeline.push({ $match: { "shopping.createdAt": dateFilter } });
  }
  pipeline.push({
    $group: {
      _id: { $dateToString: { format, date: "$shopping.createdAt" } },
      total: { $sum: "$total_price" },
      count: { $sum: "$count" }
    }
  });
  pipeline.push({ $sort: { _id: 1 } });
  return ShoppingDetail.aggregate(pipeline);
};

// Reporte de ganancia por periodo (ventas - compras)
DashboardSchema.statics.profitByPeriod = async function({ year, month, day } = {}) {
  // Usar los pipelines basados en SaleDetail y ShoppingDetail
  const sales = await this.salesByPeriod({ year, month, day });
  const purchases = await this.purchasesByPeriod({ year, month, day });
  // Unir por periodo (fecha)
  const result = sales.map(sale => {
    const purchase = purchases.find(p => p._id === sale._id);
    return {
      period: sale._id,
      sales: sale.total,
      purchases: purchase ? purchase.total : 0,
      profit: sale.total - (purchase ? purchase.total : 0)
    };
  });
  return result;
};

// Productos más vendidos con filtros de fecha
DashboardSchema.statics.topProducts = function(limit = 5, { year, month, day } = {}) {
  const SaleDetail = mongoose.model('SaleDetail');
  
  let dateFilter = {};
  if (year) {
    dateFilter.$gte = new Date(`${year}-01-01`);
    dateFilter.$lte = new Date(`${year}-12-31T23:59:59.999Z`);
    if (month) {
      const m = String(month).padStart(2, '0');
      dateFilter.$gte = new Date(`${year}-${m}-01`);
      dateFilter.$lte = new Date(`${year}-${m}-31T23:59:59.999Z`);
      if (day) {
        const d = String(day).padStart(2, '0');
        dateFilter.$gte = new Date(`${year}-${m}-${d}T00:00:00.000Z`);
        dateFilter.$lte = new Date(`${year}-${m}-${d}T23:59:59.999Z`);
      }
    }
  }

  const pipeline = [
    { $lookup: {
        from: "sales",
        localField: "sale",
        foreignField: "_id",
        as: "sale"
      }
    },
    { $unwind: "$sale" }
  ];

  if (Object.keys(dateFilter).length) {
    pipeline.push({
      $match: {
        $or: [
          { "sale.created_at": dateFilter },
          { "sale.createdAt": dateFilter }
        ]
      }
    });
  }

  pipeline.push(
    { $group: {
        _id: "$product",
        quantity: { $sum: "$count" }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: limit },
    { $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    { $project: { 
        _id: 0, 
        name: "$product.name", 
        nombre: "$product.name",
        quantity: 1,
        cantidadVendida: "$quantity"
      } 
    }
  );

  return SaleDetail.aggregate(pipeline);
};

// Categoría con más stock
DashboardSchema.statics.topCategoryStock = function() {
  return Product.aggregate([
    { $group: {
        _id: "$category",
        stock: { $sum: "$stock" }
      }
    },
    { $sort: { stock: -1 } },
    { $limit: 1 },
    { $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: "$category" },
    { $project: { _id: 0, name: "$category.name", stock: 1 } }
  ]);
};

// Reporte de devoluciones por período
DashboardSchema.statics.devolutionsByPeriod = function({ year, month, day } = {}) {
  const Devolution = require('./Devolution');
  
  let dateFilter = {};
  if (year) {
    dateFilter.$gte = new Date(`${year}-01-01`);
    dateFilter.$lte = new Date(`${year}-12-31T23:59:59.999Z`);
    if (month) {
      const m = String(month).padStart(2, '0');
      dateFilter.$gte = new Date(`${year}-${m}-01`);
      dateFilter.$lte = new Date(`${year}-${m}-31T23:59:59.999Z`);
      if (day) {
        const d = String(day).padStart(2, '0');
        dateFilter.$gte = new Date(`${year}-${m}-${d}T00:00:00.000Z`);
        dateFilter.$lte = new Date(`${year}-${m}-${d}T23:59:59.999Z`);
      }
    }
  }

  const pipeline = [];
  
  if (Object.keys(dateFilter).length) {
    pipeline.push({
      $match: {
        $or: [
          { "created_at": dateFilter },
          { "createdAt": dateFilter }
        ]
      }
    });
  }

  pipeline.push(
    { $group: {
        _id: null,
        total: { $sum: 1 },
        count: { $sum: 1 }
      }
    },
    { $project: { _id: 0, total: 1, count: 1 } }
  );

  return Devolution.aggregate(pipeline);
};

module.exports = mongoose.model('Dashboard', DashboardSchema);
