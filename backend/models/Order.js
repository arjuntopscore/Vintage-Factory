const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        image: { type: String },
        size: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    shippingAddress: {
        name: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String
    },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: { type: String, enum: ['placed', 'ordered_on_meesho', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    trackingId: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);