const CreditCupo = require('../models/CreditNew');
const Client = require('../models/Client');

// Obtener todos los cupos de clientes
exports.getCupos = async (req, res) => {
  try {
    const credits = await CreditCupo.find()
      .populate('client', 'full_name document email phone cupo')
      .populate('asignado_por', 'full_name email')
      .sort({ created_at: -1 });

    console.log('🔍 Debug - Cantidad de cupos encontrados:', credits.length);
    if (credits.length > 0) {
      console.log('🔍 Debug - Primer cupo:', {
        _id: credits[0]._id,
        client: credits[0].client,
        cupo_asignado: credits[0].cupo_asignado,
        cupo_utilizado: credits[0].cupo_utilizado
      });
    }

    // Enriquecer datos con información calculada
    const creditsWithData = credits.map(credit => ({
      ...credit.toObject(),
      cupo_disponible: credit.cupo_asignado - credit.cupo_utilizado,
      porcentaje_utilizado: credit.cupo_asignado > 0 ? 
        ((credit.cupo_utilizado / credit.cupo_asignado) * 100).toFixed(1) : 0
    }));

    res.json(creditsWithData);
  } catch (error) {
    console.error('Error al obtener cupos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// También mantener getAllCredits como alias por compatibilidad
exports.getAllCredits = exports.getCupos;

// Obtener cupo de un cliente específico
exports.getCreditById = async (req, res) => {
  try {
    const credit = await CreditCupo.findById(req.params.id)
      .populate('client', 'full_name document email phone cupo')
      .populate('asignado_por', 'full_name email');

    if (!credit) {
      return res.status(404).json({ message: 'Cupo no encontrado' });
    }

    const creditWithData = {
      ...credit.toObject(),
      cupo_disponible: credit.cupo_asignado - credit.cupo_utilizado,
      porcentaje_utilizado: credit.cupo_asignado > 0 ? 
        ((credit.cupo_utilizado / credit.cupo_asignado) * 100).toFixed(1) : 0
    };

    res.json(creditWithData);
  } catch (error) {
    console.error('Error al obtener cupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear o actualizar cupo de cliente
exports.createCredit = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para asignar cupo:', JSON.stringify(req.body, null, 2));
    
    const { 
      client, 
      cupo_asignado,
      observaciones = '',
      asignado_por
    } = req.body;

    // Validaciones
    if (!client || !cupo_asignado || cupo_asignado < 0) {
      return res.status(400).json({ 
        message: 'Cliente y cupo asignado son requeridos. El cupo debe ser mayor o igual a 0.' 
      });
    }

    // Verificar si el cliente existe
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res.status(400).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si ya existe un cupo para este cliente
    let existingCredit = await CreditCupo.findOne({ client });

    if (existingCredit) {
      // Actualizar cupo existente
      const cupoAnterior = existingCredit.cupo_asignado;
      existingCredit.cupo_asignado = cupo_asignado;
      existingCredit.observaciones = observaciones;
      existingCredit.asignado_por = asignado_por;
      existingCredit.fecha_asignacion = new Date();
      
      await existingCredit.save();

      // TAMBIÉN ACTUALIZAR EL CAMPO CUPO DEL CLIENTE
      console.log(`🔄 Actualizando campo cupo del cliente ${client} con valor: ${cupo_asignado}`);
      const clienteActualizado = await Client.findByIdAndUpdate(
        client, 
        { cupo: cupo_asignado },
        { new: true } // Devolver el documento actualizado
      );
      console.log(`✅ Cliente actualizado:`, clienteActualizado ? 
        `${clienteActualizado.full_name} - Nuevo cupo: ${clienteActualizado.cupo}` : 
        'Cliente no encontrado');

      console.log(`✅ Cupo actualizado para cliente ${client}: ${cupoAnterior} → ${cupo_asignado}`);
      
      return res.status(200).json({
        message: 'Cupo actualizado exitosamente',
        credit: existingCredit,
        cambio: {
          anterior: cupoAnterior,
          nuevo: cupo_asignado
        }
      });
    } else {
      // Crear nuevo cupo
      const newCredit = new CreditCupo({
        client,
        cupo_asignado,
        cupo_utilizado: 0,
        asignado_por,
        observaciones,
        status: 'ACTIVO'
      });

      await newCredit.save();

      // TAMBIÉN ACTUALIZAR EL CAMPO CUPO DEL CLIENTE
      console.log(`🔄 Actualizando campo cupo del cliente ${client} con valor: ${cupo_asignado}`);
      const clienteActualizado = await Client.findByIdAndUpdate(
        client, 
        { cupo: cupo_asignado },
        { new: true } // Devolver el documento actualizado
      );
      console.log(`✅ Cliente actualizado:`, clienteActualizado ? 
        `${clienteActualizado.full_name} - Nuevo cupo: ${clienteActualizado.cupo}` : 
        'Cliente no encontrado');

      // Poblar datos para respuesta
      await newCredit.populate('client', 'full_name document email phone');
      await newCredit.populate('asignado_por', 'full_name email');

      console.log(`✅ Nuevo cupo creado para cliente ${client}: ${cupo_asignado}`);
      
      res.status(201).json({
        message: 'Cupo asignado exitosamente',
        credit: newCredit
      });
    }

  } catch (error) {
    console.error('Error al crear/actualizar cupo:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Ya existe un cupo asignado para este cliente' 
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar estado del cupo
exports.updateCreditStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVO', 'SUSPENDIDO', 'INACTIVO'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const credit = await CreditCupo.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    ).populate('client', 'full_name document');

    if (!credit) {
      return res.status(404).json({ message: 'Cupo no encontrado' });
    }

    res.json({
      message: 'Estado del cupo actualizado exitosamente',
      credit
    });

  } catch (error) {
    console.error('Error al actualizar estado del cupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Utilizar parte del cupo (para cuando se haga una venta a crédito)
exports.utilizarCupo = async (req, res) => {
  try {
    const { clientId, monto } = req.body;

    if (!clientId || !monto || monto <= 0) {
      return res.status(400).json({ message: 'Cliente y monto son requeridos' });
    }

    const credit = await CreditCupo.findOne({ client: clientId, status: 'ACTIVO' });
    
    if (!credit) {
      return res.status(404).json({ message: 'Cupo no encontrado o inactivo' });
    }

    const cupoDisponible = credit.cupo_asignado - credit.cupo_utilizado;
    
    if (cupoDisponible < monto) {
      return res.status(400).json({ 
        message: 'Cupo insuficiente',
        cupo_disponible: cupoDisponible,
        monto_solicitado: monto
      });
    }

    credit.cupo_utilizado += monto;
    await credit.save();

    res.json({
      message: 'Cupo utilizado exitosamente',
      cupo_utilizado: monto,
      cupo_disponible: credit.cupo_asignado - credit.cupo_utilizado
    });

  } catch (error) {
    console.error('Error al utilizar cupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Liberar cupo (para cuando se cancele una venta o se haga un pago)
exports.liberarCupo = async (req, res) => {
  try {
    const { clientId, monto } = req.body;

    if (!clientId || !monto || monto <= 0) {
      return res.status(400).json({ message: 'Cliente y monto son requeridos' });
    }

    const credit = await CreditCupo.findOne({ client: clientId });
    
    if (!credit) {
      return res.status(404).json({ message: 'Cupo no encontrado' });
    }

    credit.cupo_utilizado = Math.max(0, credit.cupo_utilizado - monto);
    await credit.save();

    res.json({
      message: 'Cupo liberado exitosamente',
      cupo_liberado: monto,
      cupo_disponible: credit.cupo_asignado - credit.cupo_utilizado
    });

  } catch (error) {
    console.error('Error al liberar cupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar cupo de cliente
exports.deleteCredit = async (req, res) => {
  try {
    const { id } = req.params;

    const credit = await CreditCupo.findById(id);
    if (!credit) {
      return res.status(404).json({ message: 'Cupo no encontrado' });
    }

    // Verificar si tiene cupo utilizado
    if (credit.cupo_utilizado > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cupo porque tiene saldo utilizado',
        cupo_utilizado: credit.cupo_utilizado
      });
    }

    await CreditCupo.findByIdAndDelete(id);

    res.json({ message: 'Cupo eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar cupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de cupos
exports.getCreditStats = async (req, res) => {
  try {
    const stats = await CreditCupo.aggregate([
      {
        $group: {
          _id: null,
          total_clientes_con_cupo: { $sum: 1 },
          cupo_total_asignado: { $sum: '$cupo_asignado' },
          cupo_total_utilizado: { $sum: '$cupo_utilizado' },
          cupo_total_disponible: { 
            $sum: { $subtract: ['$cupo_asignado', '$cupo_utilizado'] } 
          }
        }
      }
    ]);

    const statsData = stats[0] || {
      total_clientes_con_cupo: 0,
      cupo_total_asignado: 0,
      cupo_total_utilizado: 0,
      cupo_total_disponible: 0
    };

    res.json(statsData);

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
