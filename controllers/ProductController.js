const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');

// Helper to resolve all possible vendor identifiers for a given user
const getVendorIdsForUser = async (user) => {
    if (!user) return [];
    const ids = [];
    if (user._id) ids.push(user._id.toString());
    if (user.vendorId) ids.push(user.vendorId.toString());
    if (user.supermarketId) ids.push(user.supermarketId.toString());
    
    try {
        const vendorDoc = await Vendor.findOne({ ownerId: user._id });
        if (vendorDoc) {
            ids.push(vendorDoc._id.toString());
        }
    } catch (err) {
        console.warn('Vendor lookup error:', err.message);
    }
    return [...new Set(ids)];
};

// Helper to verify if user owns the product or is an admin
const checkProductOwnership = async (product, user) => {
    if (!user) return false;
    if (user.roles && user.roles.includes('admin')) return true;
    
    const getStr = (val) => {
        if (!val) return '';
        if (typeof val === 'object' && val._id) return val._id.toString();
        return val.toString();
    };

    const prodVendorId = getStr(product.vendorId) || getStr(product.vendor) || getStr(product.supermarketId);
    if (!prodVendorId) return false;

    const vendorIds = await getVendorIdsForUser(user);
    return vendorIds.includes(prodVendorId);
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        // Validation before creation
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Name and price are required' });
        }
        if (price < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }   
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' });
        }

        // Handle image upload from multer
        let images = [];
        if (req.file) {
            // Construct the image URL using the server's base URL
            const protocol = req.protocol;
            const host = req.get('host');
            const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            images = [imageUrl];
        } else if (req.body.image) {
            // Fallback to base64 if provided
            images = [req.body.image];
        }

        const effectiveVendorId = req.user.vendorId || req.user.supermarketId || req.user._id;

        const productData = {
            name,
            price,
            description,
            category: category || 'General',
            stock: stock !== undefined ? stock : 0,
            vendorId: effectiveVendorId,
            vendor: effectiveVendorId,
            supermarketId: effectiveVendorId
        };

        if (images.length > 0) {
            productData.images = images;
        }

        const product = await Product.create(productData);

        if (!product) {
            return res.status(400).json({ message: 'Invalid product data' });
        }

        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get products (supports ?vendorId= query parameter or authenticated vendor scoping)
exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        const requestedVendorId = req.query.vendorId || req.query.vendor || req.query.supermarketId;

        if (requestedVendorId) {
            filter.$or = [
                { vendorId: requestedVendorId },
                { vendor: requestedVendorId },
                { supermarketId: requestedVendorId }
            ];
        } else if (req.user) {
            const userRoles = req.user.roles || [];
            const isVendor = userRoles.includes('supermarket') || 
                             userRoles.includes('vendor') || 
                             userRoles.includes('vendor_staff') || 
                             userRoles.includes('supermarket_owner') || 
                             req.user.role === 'vendor';
            if (isVendor) {
                // Scope strictly to authenticated vendor when no specific filter is provided
                const vendorIds = await getVendorIdsForUser(req.user);
                filter.$or = [
                    { vendorId: { $in: vendorIds } },
                    { vendor: { $in: vendorIds } },
                    { supermarketId: { $in: vendorIds } }
                ];
            }
        }

        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        const products = await Product.find(filter).populate('vendorId', 'name logoUrl email');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

// Get products strictly belonging to authenticated vendor
exports.getMyVendorProducts = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const vendorIds = await getVendorIdsForUser(req.user);
        const products = await Product.find({
            $or: [
                { vendorId: { $in: vendorIds } },
                { vendor: { $in: vendorIds } },
                { supermarketId: { $in: vendorIds } }
            ]
        }).populate('vendorId', 'name logoUrl email');

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {       
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }   

        const isOwner = await checkProductOwnership(product, req.user);
        if (!isOwner) {
            return res.status(403).json({ message: 'Unauthorized: You can only modify your own products' });
        }

        const { name, price, description, category, stock } = req.body;
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (stock !== undefined) product.stock = stock;
        
        // Handle image upload from multer
        if (req.file) {
            // Construct the image URL using the server's base URL
            const protocol = req.protocol;
            const host = req.get('host');
            const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            product.images = [imageUrl];
        } else if (req.body.image) {
            // Fallback to base64 if provided
            product.images = [req.body.image];
        }
        
        await product.save();
        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }       
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const isOwner = await checkProductOwnership(product, req.user);
        if (!isOwner) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {  
    try {
        const { id } = req.params;
        
        // Validate ObjectId format to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID format' });
        }
        
        const product = await Product.findById(id).populate('vendorId', 'name logoUrl email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }   
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }       
};  

exports.getProductsByVendor = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        
        // Validate ObjectId format to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ message: 'Invalid Vendor ID format' });
        }
        
        const products = await Product.find({
            $or: [
                { vendorId },
                { vendor: vendorId },
                { supermarketId: vendorId }
            ]
        }).populate('vendorId', 'name logoUrl email');       
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }       
};


