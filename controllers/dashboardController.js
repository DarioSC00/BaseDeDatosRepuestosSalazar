exports.getTopCategoryStock = async (req, res) => {
  try {
    const data = await Dashboard.topCategoryStock();
    res.json(data);
  } catch (error) {
    console.error('Error en getTopCategoryStock:', error);
    res.json([]);
  }
}
const Dashboard = require('../models/Dashboard');

exports.getTopLeastSoldProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const data = await Dashboard.topLeastSoldProducts(limit);
    
    // Si no hay datos, devolver array vacío
    if (!data || data.length === 0) {
      res.json([]);
      return;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error en getTopLeastSoldProducts:', error);
    res.json([]); // Devolver array vacío en lugar de error 500
  }
}


// Nuevos endpoints con filtros año, mes, día
exports.getSalesByPeriod = async (req, res) => {
  try {
    const { year, month, day } = req.query;
    console.log('🔍 Filtros recibidos en getSalesByPeriod:', { year, month, day });
    
    // Buscar DashboardDetail primero
    const DashboardDetail = require('../models/DashboardDetail');
    let period = year ? String(year) : '';
    let type = 'yearly';
    if (month) {
      period += '-' + String(month).padStart(2, '0');
      type = 'monthly';
    }
    if (day) {
      period += '-' + String(day).padStart(2, '0');
      type = 'daily';
    }
    const detail = await DashboardDetail.findOne({ period, type });
    if (detail) {
      console.log('✅ Datos encontrados en DashboardDetail:', { total: detail.total_sales });
      res.json({ total: detail.total_sales });
      return;
    }
    
    // Si no hay DashboardDetail, calcular en tiempo real
    const data = await Dashboard.salesByPeriod({
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    
    console.log('📊 Datos calculados en tiempo real:', data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de ventas');
      res.json({ total: 0 });
      return;
    }
    
    // Si tenemos datos, calcular el total
    const total = data.reduce((acc, item) => acc + (item.total || 0), 0);
    console.log('💰 Total calculado:', total);
    
    res.json({ total });
  } catch (error) {
    console.error('❌ Error en getSalesByPeriod:', error);
    res.json({ total: 0 });
  }
};

exports.getPurchasesByPeriod = async (req, res) => {
  try {
    const { year, month, day } = req.query;
    console.log('🔍 Filtros recibidos en getPurchasesByPeriod:', { year, month, day });
    
    const DashboardDetail = require('../models/DashboardDetail');
    let period = year ? String(year) : '';
    let type = 'yearly';
    if (month) {
      period += '-' + String(month).padStart(2, '0');
      type = 'monthly';
    }
    if (day) {
      period += '-' + String(day).padStart(2, '0');
      type = 'daily';
    }
    const detail = await DashboardDetail.findOne({ period, type });
    if (detail) {
      console.log('✅ Datos encontrados en DashboardDetail:', { total: detail.total_purchases });
      res.json({ total: detail.total_purchases });
      return;
    }
    
    const data = await Dashboard.purchasesByPeriod({
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    
    console.log('📊 Datos de compras calculados:', data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de compras');
      res.json({ total: 0 });
      return;
    }
    
    // Calcular el total
    const total = data.reduce((acc, item) => acc + (item.total || 0), 0);
    console.log('💰 Total de compras calculado:', total);
    
    res.json({ total });
  } catch (error) {
    console.error('❌ Error en getPurchasesByPeriod:', error);
    res.json({ total: 0 });
  }
};

exports.getProfitByPeriod = async (req, res) => {
  try {
    const { year, month, day } = req.query;
    console.log('🔍 Filtros recibidos en getProfitByPeriod:', { year, month, day });
    
    const DashboardDetail = require('../models/DashboardDetail');
    let period = year ? String(year) : '';
    let type = 'yearly';
    if (month) {
      period += '-' + String(month).padStart(2, '0');
      type = 'monthly';
    }
    if (day) {
      period += '-' + String(day).padStart(2, '0');
      type = 'daily';
    }
    const detail = await DashboardDetail.findOne({ period, type });
    if (detail) {
      console.log('✅ Datos encontrados en DashboardDetail:', { total: detail.total_profit });
      res.json({ total: detail.total_profit });
      return;
    }
    
    const data = await Dashboard.profitByPeriod({
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    
    console.log('📊 Datos de ganancias calculados:', data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de ganancias');
      res.json({ total: 0 });
      return;
    }
    
    // Calcular el total de ganancias
    const total = data.reduce((acc, item) => acc + (item.profit || 0), 0);
    console.log('💰 Total de ganancias calculado:', total);
    
    res.json({ total });
  } catch (error) {
    console.error('❌ Error en getProfitByPeriod:', error);
    res.json({ total: 0 });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const { year, month, day } = req.query;
    const DashboardDetail = require('../models/DashboardDetail');
    let period = year ? String(year) : '';
    let type = 'yearly';
    if (month) {
      period += '-' + String(month).padStart(2, '0');
      type = 'monthly';
    }
    if (day) {
      period += '-' + String(day).padStart(2, '0');
      type = 'daily';
    }
    const detail = await DashboardDetail.findOne({ period, type });
    if (detail && detail.top_products && detail.top_products.length > 0) {
      res.json(detail.top_products.slice(0, limit));
      return;
    }
    // Pasar filtros a la función topProducts
    const data = await Dashboard.topProducts(limit, {
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    if (!data || data.length === 0) {
      res.json([]);
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error en getTopProducts:', error);
    res.json([]);
  }
}

exports.getTopLeastSoldProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const { year, month, day } = req.query;
    const DashboardDetail = require('../models/DashboardDetail');
    let period = year ? String(year) : '';
    let type = 'yearly';
    if (month) {
      period += '-' + String(month).padStart(2, '0');
      type = 'monthly';
    }
    if (day) {
      period += '-' + String(day).padStart(2, '0');
      type = 'daily';
    }
    const detail = await DashboardDetail.findOne({ period, type });
    if (detail && detail.least_sold_products && detail.least_sold_products.length > 0) {
      res.json(detail.least_sold_products.slice(0, limit));
      return;
    }
    // Pasar filtros a la función topLeastSoldProducts
    const data = await Dashboard.topLeastSoldProducts(limit, {
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    if (!data || data.length === 0) {
      res.json([]);
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error en getTopLeastSoldProducts:', error);
    res.json([]);
  }
}

exports.getDevolutionsByPeriod = async (req, res) => {
  try {
    const { year, month, day } = req.query;
    console.log('🔍 Filtros recibidos en getDevolutionsByPeriod:', { year, month, day });
    
    const data = await Dashboard.devolutionsByPeriod({
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      day: day ? parseInt(day) : undefined
    });
    
    console.log('📊 Datos de devoluciones calculados:', data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de devoluciones');
      res.json({ total: 0 });
      return;
    }
    
    // Si tenemos datos, calcular el total
    const total = data.reduce((acc, item) => acc + (item.total || item.count || 1), 0);
    console.log('🔄 Total de devoluciones calculado:', total);
    
    res.json({ total });
  } catch (error) {
    console.error('❌ Error en getDevolutionsByPeriod:', error);
    res.json({ total: 0 });
  }
};