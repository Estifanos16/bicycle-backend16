const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
        },

    price: {
        type: Number,
        required: true
        },

    description: {
        type: String
        },

    stock: {
        type: Number,
        default: 0
        },

    supermarketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        }

    }, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);