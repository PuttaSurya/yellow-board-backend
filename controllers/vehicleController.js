const VehicleList = require('../models/VehicleList');
const s3 = require('../config/aws');
//const { ALLOWED_MAKES } = require('../config/make_contents');


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

exports.createVehicle = async (req, res) => {
    console.log(req.body);
    try {
      const { title, make, model, year, price, mileage, location, status, imageUrl, type, partNumber } = req.body;
  
      if (!imageUrl) {
        return res.status(400).json({ message: 'Vehicle image is required' });
      }
  
      const imageData = await decodeBase64Image(imageUrl);
      if (imageData instanceof Error) {
        return res.status(400).json({ message: 'Invalid vehicle image data' });
      }
  
      const vehicleData = {
        title,
        make,
        model,
        year,
        price,
        mileage,
        location,
        status,
        type,
        partNumber  
      };
  
      const vehicle = new VehicleList(vehicleData);
      let savedVehicle = await vehicle.save();
  
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${savedVehicle._id}.png`,
        Body: imageData.data,
        ContentType: imageData.type,
        ACL: 'public-read'
      };
  
      const data = await s3.upload(params).promise();
  
      const imageLocation = [];
      imageLocation.push(data.Location);
      savedVehicle = await VehicleList.findByIdAndUpdate(savedVehicle._id, { imageUrl: imageLocation }, { new: true });
  
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


exports.updateVehicle = async (req, res) => {
    try {
      const { title, make, model, year, price, mileage, location, status, imageUrl, partNumber } = req.body;
  
      const updateData = { title, make, model, year, price, mileage, location, status, partNumber };  // Add partNumber here
  
      // If imageUrl (base64) is provided, upload to S3
      if (imageUrl) {
        const imageData = decodeBase64Image(imageUrl);
        if (imageData instanceof Error) {
          return res.status(400).json({ message: 'Invalid image data' });
        }
  
        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: `${req.params.id}-${Date.now()}.png`,
          Body: imageData.data,
          ContentType: imageData.type,
          ACL: 'public-read'
        };
  
        const uploadResult = await s3.upload(params).promise();
        updateData.imageUrl = [uploadResult.Location]; // If multiple images, store as array
      }
  
      const updatedVehicle = await VehicleList.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      res.status(200).json({
        status: 'success',
        data: updatedVehicle
      });
  
    } catch (err) {
      console.error('Error updating vehicle:', err);
      res.status(500).json({ error: 'Server error' });
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


exports.searchVehicles = async (req, res) => {
  try {
    const {
      status,
      make,
      type, 
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      page = 1,
      limit = 10
    } = req.body;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (make) {
      filter.make = make;
    }

    if (type) {
      filter.type = type; 
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (minYear !== undefined || maxYear !== undefined) {
      filter.year = {};
      if (minYear !== undefined) {
        filter.year.$gte = Number(minYear);
      }
      if (maxYear !== undefined) {
        filter.year.$lte = Number(maxYear);
      }
    }

    const vehicles = await VehicleList.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await VehicleList.countDocuments(filter);

    res.json({
      data: vehicles,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  
  

  // GET /vehicles/type/bus
exports.getBusVehicles = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.body;
      const skip = (page - 1) * limit;
  
      const filter = { type: 'bus' };
  
      const vehicles = await VehicleList.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      const totalCount = await VehicleList.countDocuments(filter);
  
      res.json({
        data: vehicles,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // GET /vehicles/type/bus-spare
  exports.getBusSpareVehicles = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.body;
      const skip = (page - 1) * limit;
  
      const filter = { type: 'bus-spare' };
  
      const vehicles = await VehicleList.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      const totalCount = await VehicleList.countDocuments(filter);
  
      res.json({
        data: vehicles,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  