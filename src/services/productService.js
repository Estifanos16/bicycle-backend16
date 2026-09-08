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
 */
const extractValidImages = (req) => {
    if (req.file) {
        const base64Image = req.file.buffer.toString('base64');
        return [`data:${req.file.mimetype};base64,${base64Image}`];
    }

    let raw = req.body.images || req.body.image;
    if (!raw) return [];

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) raw = parsed;
        } catch (e) {
            raw = [raw];
        }
    }

    if (!Array.isArray(raw)) raw = [raw];

    return raw
        .map(img => {
            if (typeof img === 'string') return img.trim();
            if (typeof img === 'object' && img !== null && img.url) return String(img.url).trim();
            return null;
        })
        .filter(img =>
            img &&
            typeof img === 'string' &&
            img !== '[object Object]' &&
            img !== '[ {} ]' &&
            !img.includes('{}') &&
            img.length > 0
        );
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
