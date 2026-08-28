const Product = require('../models/Product');

exports.createProduct = async (req, res) => {

    try {
        const { name, price, description, category, stock } = req.body;

        // Validation before creation
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }
        if (price < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }   
        if (stock < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' });
        }

        const product = await Product.create({
            name,
            price,
            description,
            category,
            stock,
            vendorId: req.user.vendorId || req.user._id // Use vendorId if available, otherwise user._id for backward compatibility
        });

        if (!product) {
            return res.status(400).json({ message: 'Invalid product data' });
        }
        // Check authorization: user must own the vendor or be the vendor staff
        const userVendorId = req.user.vendorId || req.user._id;
        if (product.vendorId.toString() !== userVendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        } 
        

        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getProducts = async (req, res) => {

    try {
        const products = await Product.find().populate('vendorId', 'name logoUrl');
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
        const userVendorId = req.user.vendorId || req.user._id;
        if (product.vendorId.toString() !== userVendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const { name, price, description, category, stock } = req.body;
            if (name) product.name = name;
            if (price) product.price = price;
            if (description) product.description = description;
            if (category !== undefined) product.category = category;
            if (stock !== undefined) product.stock = stock;         
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

        const userVendorId = req.user.vendorId || req.user._id;
        if (product.vendorId.toString() !== userVendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Product.findByIdAndDelete(req.params.id);
         res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {  
    try {
        const product = await Product.findById(req.params.id).populate('vendorId', 'name logoUrl');
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
        const products = await Product.find({ vendorId: req.params.vendorId }).populate('vendorId', 'name logoUrl');       
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }       
};


