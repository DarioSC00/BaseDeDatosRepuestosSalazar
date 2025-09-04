const mongoose = require("mongoose")

const DevolutionDetailSchema = new mongoose.Schema({
  devolution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Devolution",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  cantidad_devuelta: {
    type: Number,
    required: true,
    min: 1,
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  producto_reemplazo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model("DevolutionDetail", DevolutionDetailSchema)
