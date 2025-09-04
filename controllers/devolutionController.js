const Devolution = require("../models/Devolution")
const DevolutionDetail = require("../models/DevolutionDetail")
const Sale = require("../models/Sale")
const Product = require("../models/Product")
const Counter = require("../models/Counter")

// Función para obtener el siguiente número de venta (FACT...)
const getNextSaleNumberForDevolution = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      "saleNumber",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    )

    const saleNumber = `FACT${counter.sequence_value.toString().padStart(6, "0")}`
    return saleNumber
  } catch (error) {
    throw new Error("Error al generar número de factura para devolución")
  }
}

// Función para obtener el siguiente número de devolución
const getNextDevolutionNumber = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      "devolutionNumber",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    )

    const devolutionNumber = `DEV${counter.sequence_value.toString().padStart(6, "0")}`
    return devolutionNumber
  } catch (error) {
    throw new Error("Error al generar número de devolución")
  }
}

// Crear una nueva devolución
exports.createDevolution = async (req, res) => {
  try {
    const { saleId, motivo, productos } = req.body
    const userId = req.userId; // ✅ Tomar del middleware de auth
    
    console.log('🔍 Debug - Datos recibidos:', {
      saleId,
      motivo,
      productos,
      userId,
      productosLength: productos?.length,
      reqUser: req.user // ✅ Log adicional
    });

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que la venta existe
    const sale = await Sale.findById(saleId)
    if (!sale) {
      return res.status(404).json({ error: "Venta no encontrada" })
    }

    // Verificar que la venta no tenga ya una devolución
    const existingDevolution = await Devolution.findOne({ sale: saleId })
    if (existingDevolution) {
      return res.status(400).json({ error: "Esta venta ya tiene una devolución registrada" })
    }

    // Validar y obtener datos de productos
    let totalDevolucion = 0
    const productosConDatos = []

    console.log('🟢 Productos recibidos en backend para devolución:', productos);
    for (const item of productos) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(400).json({ error: `Producto ${item.product} no encontrado` })
      }

      // Buscar el producto en los detalles de la venta original
      const ventaDetail = sale.sale_details.find(
        detail => detail.product.toString() === item.product.toString()
      )
      if (!ventaDetail) {
        return res.status(400).json({ error: `El producto ${product.name} no está en esta venta` })
      }

      if (item.cantidad_devuelta > ventaDetail.quantity) {
        return res.status(400).json({ 
          error: `No puedes devolver ${item.cantidad_devuelta} unidades de ${product.name}. Solo se vendieron ${ventaDetail.quantity}` 
        })
      }

      const subtotal = item.cantidad_devuelta * ventaDetail.unit_price
      totalDevolucion += subtotal

      // Aceptar ambos nombres de campo para compatibilidad
      productosConDatos.push({
        product: item.product,
        cantidad_devuelta: item.cantidad_devuelta,
        precio_unitario: ventaDetail.unit_price,
        subtotal: subtotal,
        producto_reemplazo: item.producto_reemplazo || item.productoReemplazo || null
      })
    }

    // Generar código de devolución
    const code = await getNextDevolutionNumber()

    // Crear la devolución
    const devolution = new Devolution({
      code,
      sale: saleId,
      motivo,
      total_devolucion: totalDevolucion,
      user: userId
    })

    await devolution.save()

    // Crear los detalles de la devolución
    const devolutionDetails = productosConDatos.map(item => ({
      devolution: devolution._id,
      ...item
    }))

    await DevolutionDetail.insertMany(devolutionDetails)

    // Actualizar stock de productos devueltos
    for (const item of productos) {
      await Product.findByIdAndUpdate(item.product, { 
        $inc: { stock: item.cantidad_devuelta }  // ✅ Correcto
      })

      if (item.producto_reemplazo) {
        await Product.findByIdAndUpdate(item.productoReemplazo, { 
          $inc: { stock: -item.cantidad_devuelta }  // ✅ Correcto
        })
      }
    }

    // Cambiar estado de la venta a 'devolucion'
    sale.estado = 'devolucion'
    await sale.save()

    // Crear una nueva venta que represente los productos devueltos
    // NOTA: No ajustamos stock aquí porque ya se actualizó arriba al procesar la devolución
    let newSale = null
    try {
      const newSaleCode = await getNextSaleNumberForDevolution()

      // Construir detalles para la nueva venta a partir de productosConDatos
      const newSaleDetails = productosConDatos.map(item => ({
        product: item.product,
        quantity: item.cantidad_devuelta,
        unit_price: item.precio_unitario
      }))

      newSale = new Sale({
        code: newSaleCode,
        total_value: totalDevolucion,
        notes: `Generada por devolución ${devolution.code} (venta original: ${sale.code})`,
        client: sale.client,
        user: userId,
        payment_type: 'contado',
        monto_contado: totalDevolucion,
        monto_credito: 0,
        pago_con_credito: false,
        estado: 'activa',
        sale_details: newSaleDetails
      })

      await newSale.save()
    } catch (err) {
      console.error('Error creando nueva venta por devolución:', err)
      // No interrumpir la respuesta principal; avisar en logs y continuar
    }

    res.status(201).json({
      message: "Devolución creada exitosamente",
      devolution,
      details: devolutionDetails
    })

  } catch (error) {
    console.error("Error creating devolution:", error)
    res.status(400).json({ error: error.message })
  }
}

// Obtener todas las devoluciones
exports.getDevolutions = async (req, res) => {
  try {
    const devolutions = await Devolution.find()
      .populate("sale", "code")
      .populate("user", "name email")
      .sort({ created_at: -1 })

    const devolutionsWithDetails = await Promise.all(
      devolutions.map(async (devolution) => {
        const details = await DevolutionDetail.find({ devolution: devolution._id })
          .populate({
            path: "product",
            select: "name code",
            populate: {
              path: "category",
              model: "Category",
              select: "name"
            }
          })
          .populate("producto_reemplazo", "name code")

        return {
          devolution,
          details
        }
      })
    )

    res.json(devolutionsWithDetails)
  } catch (error) {
    console.error("Error in getDevolutions:", error)
    res.status(500).json({ error: error.message })
  }
}

// Obtener una devolución por ID con sus detalles
exports.getDevolutionById = async (req, res) => {
  try {
    const devolution = await Devolution.findById(req.params.id)
      .populate("sale")
      .populate("user")

    if (!devolution) {
      return res.status(404).json({ error: "Devolución no encontrada" })
    }

    const details = await DevolutionDetail.find({ devolution: devolution._id })
      .populate({
        path: "product",
        populate: {
          path: "category",
          model: "Category"
        }
      })
      .populate("producto_reemplazo")

    res.json({
      devolution,
      details
    })
  } catch (error) {
    console.error("Error in getDevolutionById:", error)
    res.status(500).json({ error: error.message })
  }
}

// Obtener devoluciones por venta
exports.getDevolutionsBySale = async (req, res) => {
  try {
    const devolutions = await Devolution.find({ sale: req.params.saleId })
      .populate("user", "name email")
      .populate("sale", "code")

    const devolutionsWithDetails = await Promise.all(
      devolutions.map(async (devolution) => {
        const details = await DevolutionDetail.find({ devolution: devolution._id })
          .populate({
            path: "product",
            select: "name code",
            populate: {
              path: "category",
              model: "Category",
              select: "name"
            }
          })
          .populate("producto_reemplazo", "name code")

        return {
          devolution,
          details
        }
      })
    )

    res.json(devolutionsWithDetails)
  } catch (error) {
    console.error("Error in getDevolutionsBySale:", error)
    res.status(500).json({ error: error.message })
  }
}

// Obtener siguiente número de devolución
exports.getNextDevolutionNumber = async (req, res) => {
  try {
    const devolutionNumber = await getNextDevolutionNumber()
    res.json({ devolutionNumber })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
