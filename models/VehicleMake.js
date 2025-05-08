const mongoose = require('mongoose');

const vehicleMakeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('VehicleMake', vehicleMakeSchema);
