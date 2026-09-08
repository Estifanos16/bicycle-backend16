const mongoose = require('mongoose');
const {
    getVendorIdsForUser,
    checkProductOwnership,
    extractValidImages,
    parseUnit,
    parseVariants,
    createProductInDB,
    findProductById,
    findProductsByFilter,
    saveProduct,
    deleteProductById,
} = require('../services/productService');
const Vendor = require('../models/Vendor');

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, unit, variants } = req.body;

        if (!name || price === undefined || price === null || price === '') {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        const numStock = stock !== undefined && stock !== '' ? Number(stock) : 0;
        if (isNaN(numStock) || numStock < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' });
        }

        const images = extractValidImages(req);
        const parsedUnit = parseUnit(unit);
        const parsedVariants = parseVariants(variants);

        let rawVendorId = req.user?.vendorId || req.user?.supermarketId || req.body?.vendorId || req.body?.vendor || req.body?.supermarketId;
        if (!rawVendorId && req.user?._id) {
            const vendorDoc = await Vendor.findOne({ ownerId: req.user._id });
            rawVendorId = vendorDoc ? vendorDoc._id : req.user._id;
        }

        const productData = {
            name,
            price: numPrice,
            description: description || '',
            category: category || 'General',
            stock: numStock,
            unit: parsedUnit,
            variants: parsedVariants,
            images,
        };

        if (rawVendorId && mongoose.Types.ObjectId.isValid(rawVendorId)) {
            productData.vendorId = rawVendorId;
            productData.vendor = rawVendorId;
            productData.supermarketId = rawVendorId;
        }

        const product = await createProductInDB(productData);
        if (!product) return res.status(400).json({ message: 'Invalid product data' });

        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message || 'Server error creating product' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        const requestedVendorId = req.query.vendorId || req.query.vendor || req.query.supermarketId;

        if (requestedVendorId) {
            filter.$or = [
                { vendorId: requestedVendorId },
                { vendor: requestedVendorId },
                { supermarketId: requestedVendorId },
            ];
        } else if (req.user) {
            const userRoles = req.user.roles || [];
            const isVendor = userRoles.includes('supermarket') ||
                userRoles.includes('vendor') ||
                userRoles.includes('vendor_staff') ||
                userRoles.includes('supermarket_owner') ||
                req.user.role === 'vendor';
            if (isVendor) {
                const vendorIds = await getVendorIdsForUser(req.user);
                filter.$or = [
                    { vendorId: { $in: vendorIds } },
                    { vendor: { $in: vendorIds } },
                    { supermarketId: { $in: vendorIds } },
                ];
            }
        }

        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        const products = await findProductsByFilter(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyVendorProducts = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });

        const vendorIds = await getVendorIdsForUser(req.user);
        const products = await findProductsByFilter({
            $or: [
                { vendorId: { $in: vendorIds } },
                { vendor: { $in: vendorIds } },
                { supermarketId: { $in: vendorIds } },
            ],
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await findProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const isOwner = await checkProductOwnership(product, req.user);
        if (!isOwner) return res.status(403).json({ message: 'Unauthorized: You can only modify your own products' });

        const { name, price, description, category, stock, unit, variants } = req.body;
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (unit !== undefined) product.unit = parseUnit(unit);
        if (variants !== undefined) product.variants = parseVariants(variants);

        const newImages = extractValidImages(req);
        if (newImages.length > 0) product.images = newImages;

        await saveProduct(product);
        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await findProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const isOwner = await checkProductOwnership(product, req.user);
        if (!isOwner) return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });

        await deleteProductById(req.params.id);
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID format' });
        }

        const product = await findProductById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductsByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ message: 'Invalid Vendor ID format' });
        }

        const products = await findProductsByFilter({
            $or: [{ vendorId }, { vendor: vendorId }, { supermarketId: vendorId }],
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
