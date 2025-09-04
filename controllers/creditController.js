const Credit = require('../models/Credit');

// Función auxiliar para generar cuotas automáticamente
const generarCuotas = (montoTotal, cuotaInicial, numeroCuotas, frecuenciaPago, fechaInicio) => {
  const saldoPorCuotas = montoTotal - cuotaInicial;
  const montoCuota = Math.round((saldoPorCuotas / numeroCuotas) * 100) / 100;
  const cuotas = [];
  
  for (let i = 1; i <= numeroCuotas; i++) {
    // Crear una nueva fecha para cada cuota
    let fechaVencimiento = new Date(fechaInicio);
    
    // Calcular fecha de vencimiento según frecuencia
    if (frecuenciaPago === 'mensual') {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
    } else if (frecuenciaPago === 'quincenal') {
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (i * 15));
    } else if (frecuenciaPago === 'semanal') {
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (i * 7));
    }
    
    // Para la última cuota, ajustar el monto para cubrir cualquier diferencia por redondeo
    const montoCuotaFinal = i === numeroCuotas ? 
      saldoPorCuotas - (montoCuota * (numeroCuotas - 1)) : 
      montoCuota;
    
    cuotas.push({
      numero_cuota: i,
      monto_cuota: montoCuotaFinal,
      fecha_vencimiento: new Date(fechaVencimiento),
      monto_pagado: 0,
      estado: 'pendiente',
      fecha_pago: null
    });
  }
  
  return { cuotas, montoCuota };
};

// Crear un nuevo crédito
exports.createCredit = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear crédito:', JSON.stringify(req.body, null, 2));
    
    const { 
      client, 
      sales, 
      total_amount, 
      initial_fee = 0, 
      cutoff_date, 
      details = [],
      numero_cuotas = 1,
      frecuencia_pago = 'mensual'
    } = req.body;
    
    console.log('🔍 Datos extraídos:', {
      client,
      total_amount,
      initial_fee,
      numero_cuotas,
      frecuencia_pago,
      cutoff_date,
      details_length: details.length
    });
    
    if (initial_fee > total_amount) {
      console.log('❌ Error: Cuota inicial mayor al monto total');
      return res.status(400).json({ error: 'La cuota inicial no puede ser mayor al monto total.' });
    }
    
    const outstanding_balance = total_amount - initial_fee;
    console.log('💰 Saldo calculado:', outstanding_balance);
    
    // Generar cuotas automáticamente
    let cuotas = [];
    let montoCuota = 0;
    
    try {
      const result = generarCuotas(
        total_amount, 
        initial_fee, 
        numero_cuotas, 
        frecuencia_pago, 
        new Date()
      );
      cuotas = result.cuotas;
      montoCuota = result.montoCuota;
      console.log('📅 Cuotas generadas:', cuotas.length, 'Monto por cuota:', montoCuota);
    } catch (cuotaError) {
      console.error('❌ Error generando cuotas:', cuotaError);
      // Si falla, usar valores por defecto
      montoCuota = outstanding_balance / numero_cuotas;
      cuotas = [];
    }
    
    const credit = new Credit({
      client,
      sales: sales || [],
      total_amount,
      initial_fee,
      outstanding_balance,
      numero_cuotas,
      frecuencia_pago,
      monto_cuota: montoCuota,
      cuotas,
      abonos: [],
      cutoff_date,
      status: 'activo'
    });
    
    console.log('💾 Intentando guardar crédito...');
    await credit.save();
    console.log('✅ Crédito guardado exitosamente');

    // Guardar los detalles de productos asociados
    if (details.length > 0) {
      console.log('📦 Guardando detalles de productos...');
      const CreditDetail = require('../models/CreditDetail');
      const detailDocs = details.map(d => ({
        credit: credit._id,
        product: d.product._id || d.product,
        quantity: d.quantity,
        unit_price: d.unit_price,
        total_price: d.total_price
      }));
      await CreditDetail.insertMany(detailDocs);
      console.log('✅ Detalles guardados exitosamente');
    }

    res.status(201).json(credit);
  } catch (error) {
    console.error('❌ Error al crear crédito:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los créditos
exports.getCredits = async (req, res) => {
  try {
    const credits = await Credit.find()
      .populate('client')
      .populate('sale');
    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un crédito por ID
exports.getCreditById = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id)
      .populate('client')
      .populate('sales');
    if (!credit) return res.status(404).json({ error: 'Crédito no encontrado' });
    res.json(credit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un crédito (solo datos generales, no abonos)
exports.updateCredit = async (req, res) => {
  try {
    const { sales, total_amount, cutoff_date, status } = req.body;
    const credit = await Credit.findByIdAndUpdate(
      req.params.id,
      { sales, total_amount, cutoff_date, status, updated_at: Date.now() },
      { new: true }
    );
    if (!credit) return res.status(404).json({ error: 'Crédito no encontrado' });
    res.json(credit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un crédito
exports.deleteCredit = async (req, res) => {
  try {
    const credit = await Credit.findByIdAndDelete(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Crédito no encontrado' });
    res.json({ message: 'Crédito eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar un abono a un crédito
exports.addAbono = async (req, res) => {
  try {
    const { amount } = req.body;
    const credit = await Credit.findById(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Crédito no encontrado' });
    
    console.log('Saldo antes del abono:', credit.outstanding_balance);
    console.log('Monto del abono:', amount);
    
    credit.abonos.push({ amount });
    credit.outstanding_balance -= amount;
    
    // Redondear para evitar problemas de precisión decimal
    credit.outstanding_balance = Math.round(credit.outstanding_balance * 100) / 100;
    
    console.log('Saldo después del abono:', credit.outstanding_balance);
    
    // Actualizar cuotas automáticamente si existen
    if (credit.cuotas && credit.cuotas.length > 0) {
      let montoRestante = amount;
      
      // Aplicar el abono a las cuotas pendientes en orden
      for (let cuota of credit.cuotas) {
        if (montoRestante <= 0) break;
        if (cuota.estado === 'pendiente') {
          const montoPendiente = cuota.monto_cuota - cuota.monto_pagado;
          const montoAplicar = Math.min(montoRestante, montoPendiente);
          
          cuota.monto_pagado += montoAplicar;
          montoRestante -= montoAplicar;
          
          // Si la cuota se completó, marcarla como pagada
          if (cuota.monto_pagado >= cuota.monto_cuota) {
            cuota.estado = 'pagada';
            cuota.fecha_pago = new Date();
          }
        }
      }
      
      console.log('Cuotas actualizadas:', credit.cuotas.map(c => ({
        numero: c.numero_cuota,
        estado: c.estado,
        pagado: c.monto_pagado,
        total: c.monto_cuota
      })));
    }
    
    // Verificar si el crédito está completamente pagado
    if (credit.outstanding_balance <= 0.01) {
      credit.status = 'pagado';
      credit.outstanding_balance = 0;
      
      // Marcar todas las cuotas como pagadas si existe el sistema de cuotas
      if (credit.cuotas && credit.cuotas.length > 0) {
        credit.cuotas.forEach(cuota => {
          if (cuota.estado === 'pendiente') {
            cuota.estado = 'pagada';
            cuota.fecha_pago = new Date();
          }
        });
      }
      
      console.log('Estado cambiado a pagado');
    }
    
    await credit.save();
    console.log('Estado final en BD:', credit.status);
    console.log('Saldo final en BD:', credit.outstanding_balance);
    res.json(credit);
  } catch (error) {
    console.error('Error en addAbono:', error);
    res.status(400).json({ error: error.message });
  }
};

// Obtener estado de cuotas de un crédito específico
exports.getCuotasByCredit = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Crédito no encontrado' });
    
    const cuotasInfo = {
      credit_id: credit._id,
      numero_cuotas: credit.numero_cuotas,
      frecuencia_pago: credit.frecuencia_pago,
      monto_cuota: credit.monto_cuota,
      cuotas: credit.cuotas,
      resumen: {
        cuotas_pagadas: credit.cuotas.filter(c => c.estado === 'pagada').length,
        cuotas_pendientes: credit.cuotas.filter(c => c.estado === 'pendiente').length,
        cuotas_vencidas: credit.cuotas.filter(c => c.estado === 'vencida').length,
        total_pagado: credit.cuotas.reduce((sum, c) => sum + c.monto_pagado, 0),
        total_pendiente: credit.cuotas.reduce((sum, c) => sum + (c.monto_cuota - c.monto_pagado), 0)
      }
    };
    
    res.json(cuotasInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
