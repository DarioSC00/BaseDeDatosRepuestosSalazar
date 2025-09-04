// Marcar venta como devolución
exports.markAsDevolution = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
    sale.estado = "devolucion";
    await sale.save();
    res.json({ message: "Venta marcada como devolución", sale });
  } catch (error) {
    console.error("Error al marcar venta como devolución:", error);
    res.status(500).json({ error: error.message });
  }
};
const Sale = require("../models/Sale")
const SaleDetail = require("../models/SaleDetail")
const Product = require("../models/Product")
const Counter = require("../models/Counter")

// Función para obtener el siguiente número de factura
const getNextSaleNumber = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      "saleNumber",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    )
    const saleNumber = `FACT${counter.sequence_value.toString().padStart(6, "0")}`
    return saleNumber
  } catch (error) {
    throw new Error("Error al generar número de factura")
  }
}

// Endpoint para obtener el siguiente número
exports.getNextSaleNumber = async (req, res) => {
  try {
    const saleNumber = await getNextSaleNumber()
    res.json({ saleNumber })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Crear una nueva venta
exports.createSale = async (req, res) => {
  const Credit = require('../models/Credit');
  try {
  // DEBUG: registrar cuerpo de petición y userId para diagnóstico
  console.log('🔔 createSale request body:', JSON.stringify(req.body));
  console.log('🔔 createSale req.userId:', req.userId);
    const { products, pago_con_credito, client, total_value, payment_type, monto_contado = 0, monto_credito = 0, ...saleData } = req.body;

    // Validar stock de productos
    if (products && products.length > 0) {
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ error: `Producto ${item.product} no encontrado` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}` });
        }
      }
    }

    // Validar cupo y lógica de pago
    const cliente = await require('../models/Client').findById(client);
    if (!cliente) {
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }
    if (payment_type === 'credito') {
      if (typeof cliente.cupo !== 'number' || cliente.cupo < total_value) {
        return res.status(400).json({ error: `Cupo insuficiente. Cupo disponible: ${cliente.cupo}` });
      }
      cliente.cupo -= total_value;
      await cliente.save();
    } else if (payment_type === 'mixto') {
      if (typeof cliente.cupo !== 'number' || cliente.cupo < monto_credito) {
        return res.status(400).json({ error: `Cupo insuficiente para pago con crédito. Cupo disponible: ${cliente.cupo}` });
      }
      if ((Number(monto_contado) + Number(monto_credito)) !== Number(total_value)) {
        return res.status(400).json({ error: 'La suma de contado y crédito debe ser igual al total de la venta.' });
      }
      cliente.cupo -= monto_credito;
      await cliente.save();
    }

    // Asegurar que el usuario provenga del middleware de auth (req.userId)
    const sale = new Sale({
      ...saleData,
      pago_con_credito,
      client,
      total_value,
      payment_type,
      monto_contado,
      monto_credito,
      // El modelo requiere 'user' — tomar del token
      user: req.userId,
      sale_details: products,
    });

    await sale.save();

    // Crear registro de crédito solo si la venta es a crédito
    if (payment_type === 'credito') {
      const credit = new Credit({
        client,
        sale: sale._id,
        total_amount: total_value,
        initial_fee: monto_contado || 0,
        outstanding_balance: total_value - (monto_contado || 0),
        numero_cuotas: 1,
        frecuencia_pago: 'mensual',
        monto_cuota: total_value - (monto_contado || 0),
        cuotas: [{
          numero_cuota: 1,
          monto_cuota: total_value - (monto_contado || 0),
          fecha_vencimiento: new Date(),
          monto_pagado: 0,
          estado: 'pendiente',
          fecha_pago: null
        }],
        abonos: [],
        cutoff_date: new Date(),
        status: 'activo',
      });
      await credit.save();
    }
    // Crear documentos SaleDetail separados para mantener consistencia
    if (products && products.length > 0) {
      const saleDetails = products.map((item) => ({
        count: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        sale: sale._id,
        product: item.product,
      }));

      await SaleDetail.insertMany(saleDetails);

      // Actualizar stock de productos
      for (const item of products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    res.status(201).json(sale);
  } catch (error) {
  console.error('❌ Error en createSale:', error);
  // Enviar detalle para facilitar debugging (no exponer stack en producción)
  res.status(400).json({ error: error.message })
  }
}

// Listar todas las ventas
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("client")
      .populate("user")
      .populate({
        path: "sale_details.product",
        populate: {
          path: "category",
          model: "Category",
        },
      })
      .sort({ created_at: -1 })

    res.json(sales)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Obtener venta por ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("client")
      .populate("user")
      .populate({
        path: "sale_details.product",
        populate: {
          path: "category",
          model: "Category",
        },
      });

    if (!sale) {
      return res.status(404).json({ error: "Venta no encontrada" })
    }

    // Si no hay productos en sale_details, buscar en SaleDetail collection
    if (!sale.sale_details || sale.sale_details.length === 0) {
      const details = await SaleDetail.find({ sale: sale._id }).populate({
        path: "product",
        populate: {
          path: "category",
          model: "Category",
        },
      })

      // Convertir formato de SaleDetail a sale_details
      const saleWithDetails = sale.toObject()
      saleWithDetails.sale_details = details.map((detail) => ({
        product: detail.product,
        quantity: detail.count,
        unit_price: detail.unit_price,
        total_price: detail.total_price,
      }))

      return res.json(saleWithDetails)
    }

    // Buscar crédito asociado si la venta fue a crédito
    let creditInfo = null;
    if (sale.payment_type === 'credito') {
      const Credit = require('../models/Credit');
      creditInfo = await Credit.findOne({ sale: sale._id });
    }

    // Construir respuesta enriquecida
    const saleDetails = sale.toObject();
    saleDetails.tipo_transaccion = sale.payment_type === 'credito' ? 'Crédito' : 'Contado';
    if (creditInfo) {
      saleDetails.abono_inicial = creditInfo.initial_fee;
      saleDetails.monto_credito = creditInfo.outstanding_balance;
    }
    res.json(saleDetails);
  } catch (error) {
    console.error("Error in getSaleById:", error)
    res.status(500).json({ error: error.message })
  }
}

// Actualizar una venta
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" })
    res.json(sale)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Eliminar una venta
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id)
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" })

    // Eliminar también los SaleDetail asociados
    await SaleDetail.deleteMany({ sale: req.params.id })

    res.json({ message: "Venta eliminada" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
