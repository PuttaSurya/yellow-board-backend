const mongoose = require('mongoose');

const spareSchema = new mongoose.Schema({
  title: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String },
  partNumber: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  imageUrl: { type: [String], default: [] , required: true },
  condition: { type: String },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Spare', spareSchema);