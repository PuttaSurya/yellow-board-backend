const Spare = require('../models/Spare');
const s3 = require('../config/aws');

// Decode Base64 Image
function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return new Error('Invalid input string');
  }
  return {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };
}

// Create Spare
exports.createSpare = async (req, res) => {
    try {
      const {
        title,
        make,
        model,
        partNumber,
        price,
        location,
        condition,
        description,
        imageUrl,
      } = req.body;
  
      if (
        !title || !make || !partNumber || !price ||
        !location || !condition || !description || !imageUrl
      ) {
        return res.status(400).json({ message: 'All required fields must be filled, including imageUrl.' });
      }

  
      const imageData = decodeBase64Image(imageUrl);
      if (imageData instanceof Error) {
        return res.status(400).json({ message: 'Invalid image data' });
      }
  
      const spare = new Spare({
        title,
        make,
        model,
        partNumber,
        price,
        location,
        condition,
        description,
        userId: req.user.id,
      });
  
      let savedSpare = await spare.save();
  
      const params = {
        Bucket: process.env.AWS_BUCKET_SPARES,
        Key: `${savedSpare._id}.png`,
        Body: imageData.data,
        ContentType: imageData.type,
        ACL: 'public-read',
      };
  
      const data = await s3.upload(params).promise();
  
      const imageLocation = [data.Location]; 
  
      savedSpare = await Spare.findByIdAndUpdate(
        savedSpare._id,
        { imageUrl: imageLocation },
        { new: true }
      );
  
      res.status(201).json({
        status: 'success',
        data: savedSpare,
      });
    } catch (err) {
      console.error('Error creating spare:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

// Update Spare
exports.updateSpare = async (req, res) => {
    try {
      const {
        title,
        make,
        model,
        partNumber,
        price,
        location,
        condition,
        description,
        imageUrl
      } = req.body;
  
      const spareId = req.params.id;
      const existingSpare = await Spare.findById(spareId);
  
      if (!existingSpare) {
        return res.status(404).json({ message: 'Spare not found' });
      }
  
      const updateData = {
        title,
        make,
        model,
        partNumber,
        price,
        location,
        condition,
        description
      };
  
      // Handle image update if a new base64 image is provided
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
        const imageData = decodeBase64Image(imageUrl);
  
        if (imageData instanceof Error) {
          return res.status(400).json({ message: 'Invalid image data' });
        }
  
        const key = `${spareId}-${Date.now()}.png`;
  
        const params = {
          Bucket: process.env.AWS_BUCKET_SPARES,
          Key: key,
          Body: imageData.data,
          ContentType: imageData.type,
          ACL: 'public-read'
        };
  
        const uploadResult = await s3.upload(params).promise();
        updateData.imageUrl = [uploadResult.Location];
      }
  
      const updatedSpare = await Spare.findByIdAndUpdate(
        spareId,
        updateData,
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: updatedSpare
      });
  
    } catch (err) {
      console.error('Error updating spare:', err);
      res.status(500).json({
        message: 'Server error',
        error: err.message
      });
    }
  };
  


// Get All Spares
exports.getAllSparesByUserId = async (req, res) => {
    try {
      const userId = req.user.id; 
      const { page = 1, limit = 10 } = req.query;
  
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
  
      if (parsedPage < 1 || parsedLimit < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Page and limit must be positive integers.',
        });
      }
  
      const query = { userId }; 
  
      const spares = await Spare.find(query)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .sort({ createdAt: -1 });
  
      const totalCount = await Spare.countDocuments(query);
  
      res.status(200).json({
        status: 'success',
        data: spares,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(totalCount / parsedLimit),
          totalCount,
          pageSize: parsedLimit,
        },
      });
    } catch (err) {
      console.error('Error fetching user spares:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch spares for user',
        error: err.message,
      });
    }
  };
  

// Get Spare by ID
exports.getSpareById = async (req, res) => {
  try {
    const spare = await Spare.findById(req.params.id);
    if (!spare) {
      return res.status(404).json({ message: 'Spare not found' });
    }
    res.json(spare);
  } catch (err) {
    console.error('Error getting spare by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Spare
exports.deleteSpare = async (req, res) => {
  try {
    const deletedSpare = await Spare.findByIdAndDelete(req.params.id);
    if (!deletedSpare) {
      return res.status(404).json({ message: 'Spare not found' });
    }
    res.json({ message: 'Spare deleted successfully' });
  } catch (err) {
    console.error('Error deleting spare:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Spares
exports.searchSpares = async (req, res) => {
  try {
    const {
      make,
      partNumber,
      location,
      minPrice,
      maxPrice,
      condition
    } = req.body;

    const filter = {};

    if (make) filter.make = make;
    if (partNumber) filter.partNumber = { $regex: new RegExp(partNumber, 'i') };
    if (location) filter.location = { $regex: new RegExp(location, 'i') };
    if (condition) filter.condition = { $regex: new RegExp(condition, 'i') };

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const spares = await Spare.find(filter).sort({ createdAt: -1 });

    res.json({
      data: spares,
      totalCount: spares.length
    });
  } catch (err) {
    console.error('Error searching spares:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllSpares = async (req, res) => {
    try {
      const spares = await Spare.find().sort({ createdAt: -1 });
  
      res.status(200).json({
        status: 'success',
        data: spares,
      });
    } catch (err) {
      console.error('Error fetching all spares:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch all spares',
        error: err.message,
      });
    }
  };
