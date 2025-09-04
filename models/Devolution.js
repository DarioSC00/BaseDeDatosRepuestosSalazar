const mongoose = require("mongoose")

const DevolutionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
    required: true,
  },
  motivo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  total_devolucion: {
    type: Number,
    required: true,
    min: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// Middleware para actualizar updated_at
DevolutionSchema.pre("save", function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = mongoose.model("Devolution", DevolutionSchema)
