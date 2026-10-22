const Vendor = require('../models/Vendor');
const User = require('../models/User');

// Create vendor (Admin or during registration)
exports.createVendor = async (req, res) => {
  try {
    const {
      name,
      logoUrl,
      description,
      address,
      location,
      deliveryZone,
      operatingHours,
      ownerId
    } = req.body;

    // Validation
    if (!name || !ownerId) {
      return res.status(400).json({ message: 'Name and owner ID are required' });
    }

    // Location and deliveryZone are now optional - defaults will be used if not provided
    const vendorData = {
      name,
      logoUrl,
      description,
      address,
      operatingHours,
      ownerId,
      isApproved: false // Requires admin approval
    };

    // Only add location if provided, otherwise schema default will be used
    if (location && location.coordinates && location.coordinates.length === 2) {
      vendorData.location = location;
    }

    // Only add deliveryZone if provided, otherwise schema default will be used
    if (deliveryZone && deliveryZone.coordinates) {
      vendorData.deliveryZone = deliveryZone;
    }

    const vendor = await Vendor.create(vendorData);

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
    // Query the Vendor collection directly for approved vendors
    const vendors = await Vendor.find({ isApproved: true })
      .populate('ownerId', 'name email branding operations');

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

// Approve vendor (Admin only) - accepts Vendor ID or User ID
exports.approveVendor = async (req, res) => {
  try {
    const id = req.params.id;

    // First try to find by Vendor ID
    let vendor = await Vendor.findById(id);

    // If not found, try to find by User ID (ownerId)
    if (!vendor) {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Vendor or User not found' });
      }

      // Check if user is a vendor
      if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
        return res.status(400).json({ message: 'User is not a vendor' });
      }

      // Check if vendor already exists for this user
      const existingVendor = await Vendor.findOne({ ownerId: user._id });

      if (existingVendor) {
        // Approve existing vendor
        existingVendor.isApproved = true;
        await existingVendor.save();
        return res.status(200).json({ message: 'Vendor approved', vendor: existingVendor });
      }

      // Create new vendor document from user data
      vendor = await Vendor.create({
        name: user.branding?.storeName || user.name,
        description: user.branding?.businessBio || '',
        address: {
          street: user.operations?.streetAddress || '',
          city: user.operations?.city || '',
          state: user.operations?.region || '',
          zipCode: user.operations?.postalCode || '',
          country: 'Ethiopia'
        },
        location: {
          type: 'Point',
          coordinates: [38.7578, 8.9638] // Default to Addis Ababa
        },
        deliveryZone: {
          type: 'Polygon',
          coordinates: [[
            [38.7, 8.9],
            [38.8, 8.9],
            [38.8, 9.0],
            [38.7, 9.0],
            [38.7, 8.9]
          ]]
        },
        ownerId: user._id,
        isApproved: true,
        isOpen: true
      });

      // Link vendor to user
      user.supermarketId = vendor._id;
      user.vendorId = vendor._id;
      await user.save();

      return res.status(200).json({ message: 'Vendor created and approved', vendor });
    }

    // Vendor found by ID - just approve it
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

