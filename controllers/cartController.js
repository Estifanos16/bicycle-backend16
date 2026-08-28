const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart for a specific vendor
exports.getCart = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    let cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    }).populate('items.productId');

    if (!cart) {
      // Return empty cart structure
      return res.status(200).json({
        userId: req.user._id,
        vendorId: vendorId,
        items: [],
        couponCode: ''
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { vendorId, productId, quantity } = req.body;

    if (!vendorId || !productId || !quantity) {
      return res.status(400).json({ message: 'Vendor ID, product ID, and quantity are required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Verify product exists and belongs to vendor
    const product = await Product.findOne({ _id: productId, vendorId: vendorId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to this vendor' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        vendorId: vendorId,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Not enough stock for requested quantity' });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: productId,
        quantity: quantity,
        priceAtAdd: product.price,
        name: product.name
      });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { vendorId, productId, quantity } = req.body;

    if (!vendorId || !productId || quantity === undefined) {
      return res.status(400).json({ message: 'Vendor ID, product ID, and quantity are required' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    const cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity with stock check
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { vendorId, productId } = req.params;

    const cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.couponCode = '';

    await cart.save();

    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply coupon code
exports.applyCoupon = async (req, res) => {
  try {
    const { vendorId, couponCode } = req.body;

    if (!vendorId || !couponCode) {
      return res.status(400).json({ message: 'Vendor ID and coupon code are required' });
    }

    const cart = await Cart.findOne({
      userId: req.user._id,
      vendorId: vendorId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // TODO: Implement coupon validation logic
    // For now, just store the code
    cart.couponCode = couponCode;

    await cart.save();

    res.status(200).json({ message: 'Coupon applied', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all user carts (for different vendors)
exports.getUserCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ userId: req.user._id })
      .populate('vendorId', 'name logoUrl')
      .populate('items.productId');

    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
