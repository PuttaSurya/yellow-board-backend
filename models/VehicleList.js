const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  mileage: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  imageUrl: { type: [String], required: false } // Array of image URLs
}, { timestamps: true });

module.exports = mongoose.model('VehicleList', vehicleSchema);
