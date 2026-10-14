const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    images: [{ type: String }],
    category: { type: String },
    variants: [{
        size: { type: String },
        stock: { type: Number, default: 0 }
    }],
    meeshoPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    mrp: { 
        type: Number, 
        validate: {
            validator: function(v) { return v == null || v >= this.sellingPrice; },
            message: 'MRP must be >= sellingPrice'
        }
    },
    freeDelivery: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    meeshoUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes for faster queries and sorting
productSchema.index({ category: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ ratingAverage: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', category: 'text' });

productSchema.virtual('discountPercent').get(function() {
    if (this.mrp && this.sellingPrice && this.mrp > this.sellingPrice) {
        return Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
    }
    return 0;
});

module.exports = mongoose.model('Product', productSchema);