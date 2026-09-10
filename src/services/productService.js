const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');

// ── Vendor resolution helpers ─────────────────────────────────────────────────

/**
 * Resolve all possible vendor IDs for the authenticated user.
 */
const getVendorIdsForUser = async (user) => {
    if (!user) return [];
    const ids = [];
    if (user._id) ids.push(user._id.toString());
    if (user.vendorId) ids.push(user.vendorId.toString());
    if (user.supermarketId) ids.push(user.supermarketId.toString());

    try {
        const vendorDoc = await Vendor.findOne({ ownerId: user._id });
        if (vendorDoc) ids.push(vendorDoc._id.toString());
    } catch (err) {
        console.warn('Vendor lookup error:', err.message);
    }
    return [...new Set(ids)];
};

/**
 * Returns true if the user owns the product or is an admin.
 */
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

// ── Image / unit / variant parsers ───────────────────────────────────────────

/**
 * Extract and sanitize product image strings from the request.
 * Handles both disk storage (file paths) and memory storage (base64).
 */
const extractValidImages = (req) => {
    const images = [];

    // Handle multiple file uploads from multer.array('images')
    if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
            if (file.buffer) {
                // Memory storage (serverless) - convert to base64
                const base64Image = file.buffer.toString('base64');
                images.push(`data:${file.mimetype};base64,${base64Image}`);
            } else if (file.filename) {
                // Disk storage (local) - use file path
                const protocol = req.protocol;
                const host = req.get('host');
                images.push(`${protocol}://${host}/uploads/${file.filename}`);
            }
        });
    }

    // Handle single file upload (backward compatibility)
    if (req.file) {
        if (req.file.buffer) {
            const base64Image = req.file.buffer.toString('base64');
            images.push(`data:${req.file.mimetype};base64,${base64Image}`);
        } else if (req.file.filename) {
            const protocol = req.protocol;
            const host = req.get('host');
            images.push(`${protocol}://${host}/uploads/${req.file.filename}`);
        }
    }

    // Handle URL/base64 strings from form data
    let raw = req.body.images || req.body.image;
    if (raw) {
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) raw = parsed;
            } catch (e) {
                raw = [raw];
            }
        }

        if (!Array.isArray(raw)) raw = [raw];

        raw.forEach(img => {
            if (typeof img === 'string') {
                const trimmed = img.trim();
                if (trimmed && 
                    trimmed !== '[object Object]' && 
                    trimmed !== '[ {} ]' && 
                    !trimmed.includes('{}') && 
                    trimmed.length > 0) {
                    images.push(trimmed);
                }
            } else if (typeof img === 'object' && img !== null && img.url) {
                const url = String(img.url).trim();
                if (url && url.length > 0) {
                    images.push(url);
                }
            }
        });
    }

    return images;
};

const validUnits = ['piece', 'kg', 'g', 'liter', 'ml', 'pack', 'box'];

const parseUnit = (rawUnit) => {
    if (rawUnit && validUnits.includes(String(rawUnit).toLowerCase())) {
        return String(rawUnit).toLowerCase();
    }
    return 'piece';
};

const parseVariants = (rawVariants) => {
    if (!rawVariants) return [];
    let variants = rawVariants;
    if (typeof rawVariants === 'string') {
        try {
            variants = JSON.parse(rawVariants);
        } catch (e) {
            console.warn('Failed to parse variants JSON string:', e.message);
            return [];
        }
    }
    if (!Array.isArray(variants)) return [];
    return variants.map(v => ({
        name: String(v.name || ''),
        sku: String(v.sku || ''),
        price: v.price !== undefined && v.price !== null && v.price !== '' ? Number(v.price) : 0,
        stock: v.stock !== undefined && v.stock !== null && v.stock !== '' ? Number(v.stock) : 0,
        attributes: v.attributes && typeof v.attributes === 'object' ? v.attributes : {}
    }));
};

// ── DB query functions ────────────────────────────────────────────────────────

const createProductInDB = async (productData) => {
    return await Product.create(productData);
};

const findProductById = async (id) => {
    return await Product.findById(id).populate('vendorId', 'name logoUrl email');
};

const findProductsByFilter = async (filter) => {
    return await Product.find(filter).populate('vendorId', 'name logoUrl email');
};

const saveProduct = async (product) => {
    return await product.save();
};

const deleteProductById = async (id) => {
    return await Product.findByIdAndDelete(id);
};

module.exports = {
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
};
