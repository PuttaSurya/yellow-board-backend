const VehicleList = require('../models/VehicleList');
const s3 = require('../config/aws');


// Create an image from a base64 encoded string
function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};

  if (matches.length !== 3) {
      return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
}

// Create a vehicle
exports.createVehicle = async (req, res) => {
  console.log(req.body);
  try {
    const { title, make, model, year, price, mileage, location, status, imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Vehicle image is required' });
    }

    const imageData = await decodeBase64Image(imageUrl);
    console.log('imageData', imageData);
    if (imageData instanceof Error) {
        return res.status(400).json({message: 'Invalid vehicle image data'});
    }

    const vehicleData = {
      title,
      make,
      model,
      year,
      price,
      mileage,
      location,
      status
    };

    const vehicle = new VehicleList(vehicleData);
    let savedVehicle = await vehicle.save();

    console.log('savedVehicle', savedVehicle);

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `${savedVehicle._id}.png`,
      Body: imageData.data,
      ContentType: imageData.type,
      ACL: 'public-read'
    };

    console.log('params', params);

    const data = await s3.upload(params).promise();
    console.log('data', data);

    const imageLocation = [];
    imageLocation.push(data.Location);
    savedVehicle = await VehicleList.findByIdAndUpdate(savedVehicle._id, { imageUrl: imageLocation }, { new: true });
    console.log('savedVehicle', savedVehicle);

    res.status(201).json({
      status: 'success',
      data: savedVehicle
    });


  } catch (err) {
    console.error('Error saving vehicle:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleList.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleList.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const deleted = await VehicleList.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
