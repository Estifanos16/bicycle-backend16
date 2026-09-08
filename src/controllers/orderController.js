const Product = require('../models/Product');
const {
    generateOrderNumber,
    createOrderInDB,
    findOrderById,
    getPendingOrdersFromDB,
    getOrdersByCustomer,
    getOrdersByRider,
    getOrdersByVendor,
    findDuplicateOrder,
} = require('../services/orderService');

exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, vendorId, idempotencyKey } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Idempotency check — prevent duplicate orders
        const existing = await findDuplicateOrder(idempotencyKey);
        if (existing) {
            return res.status(200).json({ message: 'Order already processed', order: existing });
        }

        let orderItems = [];
        let totalPrice = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            if (!updatedProduct) return res.status(400).json({ message: 'Not enough stock' });

            totalPrice += updatedProduct.price * item.quantity;
            orderItems.push({
                productId: item.productId,
                name: updatedProduct.name,
                quantity: item.quantity,
                price: updatedProduct.price,
            });
        }

        const order = await createOrderInDB({
            orderNumber: generateOrderNumber(),
            customerId: req.user._id,
            vendorId,
            items: orderItems,
            status: 'created',
            statusHistory: [{ status: 'created', timestamp: new Date(), actorId: req.user._id }],
            pricing: {
                subtotal: totalPrice,
                deliveryFee: 0,
                serviceFee: 0,
                tax: 0,
                discount: 0,
                tip: 0,
                total: totalPrice,
                currency: 'USD',
            },
            deliveryAddress: { fullAddress: deliveryAddress },
            idempotencyKey: idempotencyKey || null,
        });

        res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await getPendingOrdersFromDB();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptOrder = async (req, res) => {
    try {
        const order = await findOrderById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Order already taken' });

        order.status = 'accepted';
        order.riderId = req.user._id;
        await order.save();

        res.status(200).json({ message: 'Order accepted', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await findOrderById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.statusHistory.push({
            status,
            timestamp: new Date(),
            actorId: req.user._id,
            notes: `Status changed from ${order.status} to ${status}`,
        });
        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Status updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await getOrdersByCustomer(req.user._id);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyDeliveries = async (req, res) => {
    try {
        const orders = await getOrdersByRider(req.user._id);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVendorOrders = async (req, res) => {
    try {
        const userVendorId = req.user.vendorId || req.user._id;
        const orders = await getOrdersByVendor(userVendorId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
