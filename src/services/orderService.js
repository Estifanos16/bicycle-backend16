const Order = require('../models/Order');

// ── Order number generator ────────────────────────────────────────────────────

const generateOrderNumber = () =>
    'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

// ── DB query functions ────────────────────────────────────────────────────────

const createOrderInDB = async (data) => {
    return await Order.create(data);
};

const findOrderById = async (id) => {
    return await Order.findById(id);
};

const getPendingOrdersFromDB = async () => {
    return await Order.find({ status: 'pending' });
};

const getOrdersByCustomer = async (customerId) => {
    return await Order.find({ customerId });
};

const getOrdersByRider = async (riderId) => {
    return await Order.find({ riderId });
};

const getOrdersByVendor = async (vendorId) => {
    return await Order.find({ vendorId });
};

const findDuplicateOrder = async (idempotencyKey) => {
    if (!idempotencyKey) return null;
    return await Order.findOne({ idempotencyKey });
};

module.exports = {
    generateOrderNumber,
    createOrderInDB,
    findOrderById,
    getPendingOrdersFromDB,
    getOrdersByCustomer,
    getOrdersByRider,
    getOrdersByVendor,
    findDuplicateOrder,
};
