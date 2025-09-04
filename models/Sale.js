const mongoose = require("mongoose")

const SaleSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  total_value: { type: Number, required: true, min: 0 },
  pass: { type: Number, min: 0 },
  outstanding_balance: { type: Number, min: 0 },
  notes: { type: String, trim: true, maxlength: 300 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
  payment_type: { type: String, required: true, enum: ["contado", "credito", "mixto"] },
  monto_contado: { type: Number, min: 0 },
  monto_credito: { type: Number, min: 0 },
  pago_con_credito: { type: Boolean, default: false, description: 'Indica si la venta se pagó con crédito del cliente' },
  estado: { type: String, enum: ["activa", "devolucion", "cancelada"], default: "activa" },
  sale_details: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
      unit_price: { type: Number, required: true, min: 0 }
    }
  ]
})

// Middleware para actualizar updated_at
SaleSchema.pre("save", function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = mongoose.model("Sale", SaleSchema)
