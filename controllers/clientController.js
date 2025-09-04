const Client = require("../models/Client")

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
  try {
    // Verificar si ya existe un cliente con ese tipo y documento
    const existingClient = await Client.findOne({
      type_document: req.body.type_document,
      document: req.body.document,
    })
    if (existingClient) {
      return res.status(400).json({
        error: "Ya existe un cliente con ese tipo y número de documento",
        field: "document",
      })
    }

    // Verificar si ya existe un cliente con ese email
    const existsEmail = await Client.findOne({ email: req.body.email })
    if (existsEmail)
      return res.status(400).json({ msg: "El correo ya está registrado." })

    // Verificar si ya existe un cliente con ese teléfono
    const existsPhone = await Client.findOne({ phone: req.body.phone })
    if (existsPhone)
      return res.status(400).json({ msg: "El teléfono ya está registrado." })

    const client = new Client(req.body)
    await client.save()
    res.status(201).json(client)
  } catch (error) {
    // Manejar errores de duplicado de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      let message = "Ya existe un cliente con ese dato"
      if (field === "type_document_document") {
        message = "Ya existe un cliente con ese tipo y número de documento"
      } else if (field === "email") {
        message = "Ya existe un cliente con ese email"
      }
      return res.status(400).json({
        error: message,
        field: field,
      })
    }
    res.status(400).json({ error: error.message })
  }
}

// Obtener todos los clientes
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ created_at: -1 }) // Corregido: era createdAt
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Obtener un cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Actualizar un cliente
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id

    // Si se está actualizando el documento, verificar que no exista en otro cliente
    if (req.body.document) {
      const existingClient = await Client.findOne({
        document: req.body.document,
        _id: { $ne: clientId }, // Excluir el cliente actual
      })
      if (existingClient) {
        return res.status(400).json({
          error: "Ya existe otro cliente con ese número de documento",
          field: "document",
        })
      }
    }

    // Si se está actualizando el email, verificar que no exista en otro cliente
    if (req.body.email) {
      const existingEmail = await Client.findOne({
        email: req.body.email,
        _id: { $ne: clientId },
      })
      if (existingEmail) {
        return res.status(400).json({
          error: "Ya existe otro cliente con ese email",
          field: "email",
        })
      }
    }

    req.body.updated_at = new Date()
    const client = await Client.findByIdAndUpdate(clientId, req.body, { new: true })
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" })
    res.json(client)
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      let message = "Ya existe un cliente con ese dato"

      if (field === "document") {
        message = "Ya existe otro cliente con ese número de documento"
      } else if (field === "email") {
        message = "Ya existe otro cliente con ese email"
      }

      return res.status(400).json({
        error: message,
        field: field,
      })
    }
    res.status(400).json({ error: error.message })
  }
}

// Eliminar un cliente
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" })
    res.json({ message: "Cliente eliminado" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Cambiar estado del cliente
exports.changeClientStatus = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" })

    // Corregido: era client.estado, debe ser client.status
    client.status = client.status === "ACTIVO" ? "INACTIVO" : "ACTIVO"
    client.updated_at = new Date()
    await client.save()

    res.json({
      message: `Cliente ${client.status === "ACTIVO" ? "activado" : "desactivado"} exitosamente`,
      client,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
