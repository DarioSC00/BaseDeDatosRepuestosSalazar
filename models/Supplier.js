const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  type_document: { type: String, required: true },
  document: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
