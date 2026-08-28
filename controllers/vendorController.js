const Vendor = require('../models/Vendor');

// Create vendor (Admin or during registration)
exports.createVendor = async (req, res) => {
  try {
    const {
      name,
      logoUrl,
      description,
      address,
      location,
      operatingHours,
      ownerId
    } = req.body;

    // Validation
    if (!name || !ownerId) {
      return res.status(400).json({ message: 'Name and owner ID are required' });
    }

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid location coordinates are required [longitude, latitude]' });
    }

    const vendor = await Vendor.create({
      name,
      logoUrl,
      description,
      address,
      location,
      operatingHours,
      ownerId,
      isApproved: false // Requires admin approval
    });

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vendors (public)
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true })
      .populate('ownerId', 'name email');
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('ownerId', 'name email');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check authorization
    if (vendor.ownerId.toString() !== req.user._id.toString() && 
        !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const {
      name,
      logoUrl,
      description,
      address,
      location,
      operatingHours,
      isOpen,
      commissionRate
    } = req.body;

    if (name) vendor.name = name;
    if (logoUrl !== undefined) vendor.logoUrl = logoUrl;
    if (description !== undefined) vendor.description = description;
    if (address) vendor.address = address;
    if (location) vendor.location = location;
    if (operatingHours) vendor.operatingHours = operatingHours;
    if (isOpen !== undefined) vendor.isOpen = isOpen;
    if (commissionRate !== undefined && req.user.roles.includes('admin')) {
      vendor.commissionRate = commissionRate;
    }

    await vendor.save();
    res.status(200).json({ message: 'Vendor updated', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve vendor (Admin only)
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isApproved = true;
    await vendor.save();

    res.status(200).json({ message: 'Vendor approved', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendors near location (geospatial query)
exports.getNearbyVendors = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const vendors = await Vendor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isApproved: true,
      isOpen: true
    }).populate('ownerId', 'name email');

    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete vendor (Admin only)
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
