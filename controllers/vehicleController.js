const VehicleList = require('../models/VehicleList');
const s3 = require('../config/aws');
const VehicleMake = require('../models/VehicleMake');
const { ALLOWED_MAKES } = require('../config/make_constants');



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
    try {
      const {
        title, make, model, price,  location, status,
        imageUrl, distance_traveled, fuel_efficiency,
        fuel_type, seating_capacity, cabin_tpye, year_manufacture, maintenance_record,
        upgrades, condition, description
      } = req.body;
  
      if (!imageUrl) {
        return res.status(400).json({ message: 'Vehicle image is required' });
      }
  
      if (!ALLOWED_MAKES.includes(make)) {
        return res.status(400).json({ message: 'Invalid vehicle make' });
      }
  
      const imageData = decodeBase64Image(imageUrl);
      if (imageData instanceof Error) {
        return res.status(400).json({ message: 'Invalid vehicle image data' });
      }
  
      const vehicleData = {
        title, make, model, price, location, status, distance_traveled, fuel_efficiency, fuel_type, seating_capacity, cabin_tpye,
        year_manufacture, maintenance_record, upgrades, condition, description,
        userId: req.user.id
      };
  
      const vehicle = new VehicleList(vehicleData);
      let savedVehicle = await vehicle.save();
  
      const params = {
        Bucket: process.env.AWS_BUCKET_VEHICLES,
        Key: `${savedVehicle._id}.png`,
        Body: imageData.data,
        ContentType: imageData.type,
        ACL: 'public-read'
      };
  
      const data = await s3.upload(params).promise();
      const imageLocation = [data.Location];
  
      savedVehicle = await VehicleList.findByIdAndUpdate(
        savedVehicle._id,
        { imageUrl: imageLocation },
        { new: true }
      );
  
      res.status(201).json({
        status: 'success',
        data: savedVehicle
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };


  exports.getAllVehiclesByUserId = async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query.page || {}; 
      const page = parseInt(req.query.page?.page) || 1;  // Default page 1
      const limit = parseInt(req.query.page?.limit) || 10; // Default limit 10
  
      // Filter by userId and optional status
      const query = { userId };
      if (status) query.status = status;
  
      // Fetch vehicles with pagination
      const vehicles = await VehicleList.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      // Get total count for pagination
      const totalCount = await VehicleList.countDocuments(query);
  
      res.status(200).json({
        status: 'success',
        data: vehicles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          pageSize: limit
        }
      });
    } catch (err) {
      console.error('Error fetching user vehicles:', err);
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
      const {
        title, make, model, price, location, status, imageUrl,
        distance_traveled, fuel_efficiency, fuel_type, seating_capacity, cabin_tpye,
        year_manufacture, maintenance_record, upgrades, condition, description
      } = req.body;
  
      const updateData = {
        title, make, model, price, location, status,
        distance_traveled, fuel_efficiency, fuel_type, seating_capacity, cabin_tpye,
        year_manufacture, maintenance_record, upgrades, condition, description
      };
  
      if (!ALLOWED_MAKES.includes(make)) {
        return res.status(400).json({ message: 'Invalid vehicle make' });
      }
  
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
        const imageData = decodeBase64Image(imageUrl);
        if (imageData instanceof Error) {
          return res.status(400).json({ message: 'Invalid image data' });
        }
      
        const params = {
          Bucket: process.env.AWS_BUCKET_VEHICLES,
          Key: `${req.params.id}-${Date.now()}.png`,
          Body: imageData.data,
          ContentType: imageData.type,
          ACL: 'public-read'
        };
      
        const data = await s3.upload(params).promise();
        const imageLocation = [data.Location];
        
        updateData.imageUrl = imageLocation; // Add this line to update the imageUrl
      }
  
      const updatedVehicle = await VehicleList.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!updatedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      res.status(200).json({
        status: 'success',
        data: updatedVehicle
      });
    } catch (err) {
      console.error('Error updating vehicle:', err);
      res.status(500).json({ message: 'Error updating vehicle', error: err.message });
    }
  };
  
  exports.getMakeCounts = async (req, res) => {
    try {
        const makeCounts = await VehicleList.aggregate([
            {
              $group: {
                _id: '$make',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                make: '$_id',
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { count: -1 }
            }
          ]);          
  
      res.status(200).json(makeCounts);
    } catch (err) {
      console.error('Error getting make counts:', err);
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


exports.getAllLocations = async (req, res) => {
    try {
      const locations = await VehicleList.distinct('location');
      res.status(200).json({ locations });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

  exports.searchVehicles = async (req, res) => {
    try {
      const {
        status,
        make,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        minDistance,
        maxDistance,
        location,
      } = req.body;
  
      const filter = {};
  
      // Filter by status
      if (status && status !== 'All') {
        filter.status = status;
      }
  
      // Filter by make
      if (make) {
        const makesArray = make.split(',').map((m) => m.trim());
        filter.make = { $in: makesArray };
      }
  
  
      // Filter by price range
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) {
          filter.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
          filter.price.$lte = Number(maxPrice);
        }
      }
  
      // Filter by year of manufacture
      if (minYear !== undefined || maxYear !== undefined) {
        filter.year_manufacture = {};
        if (minYear !== undefined) {
          filter.year_manufacture.$gte = Number(minYear);
        }
        if (maxYear !== undefined) {
          filter.year_manufacture.$lte = Number(maxYear);
        }
      }
  
      // Filter by distance_traveled
      if (minDistance !== undefined || maxDistance !== undefined) {
        filter.distance_traveled = {};
        if (minDistance !== undefined) {
          filter.distance_traveled.$gte = Number(minDistance);
        }
        if (maxDistance !== undefined) {
          filter.distance_traveled.$lte = Number(maxDistance);
        }
      }
  
      // Filter by state from location
      if (location) {
        const statesArray = location.split(',').map((state) => state.trim());
        filter.$or = statesArray.map((state) => ({
          location: { $regex: new RegExp(`,\\s*${state}$`, 'i') },
        }));
      }
  
      const vehicles = await VehicleList.find(filter).sort({ createdAt: -1 });
  
      res.json({
        data: vehicles,
        totalCount: vehicles.length,
      });
    } catch (err) {
      console.error('Vehicle search failed:', err);
      res.status(500).json({ error: err.message });
    }
  };
  
// GET /vehicles/all
exports.getAllVehicles = async (req, res) => {
    try {
      const vehicles = await VehicleList.find({ status: { $ne: 'sold' } })
        .sort({ 
          status: -1,      
          createdAt: -1 
        });
  
      res.json({
        data: vehicles,
        totalCount: vehicles.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
  

  
  