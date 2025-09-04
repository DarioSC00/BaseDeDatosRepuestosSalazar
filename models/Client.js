const mongoose = require("mongoose")

const ClientSchema = new mongoose.Schema({
  type_document: {
    type: String,
    required: true,
    enum: ["CC", "NIT", "CE", "TI", "PAS"],
    trim: true,
  },
  document: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 20,
    match: /^[0-9]+$/,
    trim: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{7,15}$/,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    unique: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
    cupo: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      description: 'Cupo máximo de crédito asignado por el administrador',
    },
  status: {
    type: String,
    enum: ["ACTIVO", "INACTIVO"],
    default: "ACTIVO",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  client_type: {
    type: String,
    enum: ["mayorista", "detal"],
    required: true,
    default: "detal",
  },
})

// Índice compuesto único para type_document + document
ClientSchema.index({ type_document: 1, document: 1 }, { unique: true });

module.exports = mongoose.model("Client", ClientSchema)
