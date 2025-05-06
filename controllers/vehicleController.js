const VehicleList = require('../models/VehicleList');


exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new VehicleList(req.body);
    const saved = await vehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleList.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleList.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.deleteVehicle = async (req, res) => {
  try {
    const deleted = await VehicleList.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
