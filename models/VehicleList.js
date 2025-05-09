const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  imageUrl: { type: [String], required: false },
  partNumber: { type: String, required: false },
  type: {
    type: String,
    enum: ['bus', 'bus-spare'],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  distance_traveled: { type: Number, required: false },
  fuel_efficiency: { type: Number, required: false },
  fuel_type: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'CNG', 'fuel'],
    default: 'fuel'
  },
  seating_capacity: { type: Number, required: false },
  year_manufacture: { type: Number, required: false },
  maintenance_record: { type: String, required: false },
  upgrades: { type: String, required: false },
  condition: { type: String, required: false },
  description: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('VehicleList', vehicleSchema);
