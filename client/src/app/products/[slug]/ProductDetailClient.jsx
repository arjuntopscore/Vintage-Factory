"use client";
import { useEffect, useState, use } from 'react';
import SafeImage from "@/src/components/SafeImage";
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { formatPrice, cn } from '../../../lib/utils';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

export default function ProductDetail({ params }) {
    const { slug } = use(params);
    const [product, setProduct] = useState(null);
    const [selectedImg, setSelectedImg] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [qty, setQty] = useState(1);
    const { addItem } = useCartStore();
    const { user } = useAuthStore();

    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    
    useEffect(() => {
        api.get(`/products/${slug}`)
            .then(res => {
                setProduct(res.data);
                setSelectedImg(res.data.images[0]);
                if (res.data.variants?.length > 0) {
                    const firstAvail = res.data.variants.find(v => v.stock > 0);
                    if(firstAvail) setSelectedSize(firstAvail.size);
                }
                // Fetch reviews once we have product id
                return api.get(`/products/${res.data._id}/reviews`);
            })
            .then(res => {
                if (res && res.data) setReviews(res.data.reviews || []);
            })
            .catch(() => toast.error('Failed to load product details'));
    }, [slug]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await api.post(`/products/${product._id}/reviews`, reviewForm);
            toast.success('Review added successfully');
            setReviews([res.data.review, ...reviews]);
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!product) return <div className="p-8 text-center">Loading...</div>;

    const handleAddToCart = () => {
        if (!selectedSize) return toast.error('Please select a size');
        addItem({
            productId: product._id,
            title: product.title,
            image: product.images[0],
            size: selectedSize,
            price: product.sellingPrice,
            qty
        });
        toast.success('Added to cart');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-4">
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
                        {selectedImg && <SafeImage src={selectedImg} alt={product.title} fill className="object-cover" />}
                    </div>
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, i) => (
                                <button key={i} onClick={() => setSelectedImg(img)} className={cn("relative aspect-square rounded-xl overflow-hidden border-2", selectedImg === img ? "border-[#e11d74]" : "border-transparent")}>
                                    <SafeImage src={img} alt="thumbnail" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">{product.category}</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                    
                    {product.ratingCount > 0 && (
                        <div className="flex items-center mb-4">
                            <div className="flex items-center bg-green-600 text-white text-sm font-bold px-2 py-0.5 rounded mr-2">
                                {product.ratingAverage?.toFixed(1)} <span className="ml-1 text-xs">★</span>
                            </div>
                            <span className="text-sm text-gray-500">{product.ratingCount} Ratings & Reviews</span>
                        </div>
                    )}
                    
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.sellingPrice)}</span>
                        {product.mrp && product.mrp > product.sellingPrice && (
                            <>
                                <span className="text-lg text-gray-500 line-through">{formatPrice(product.mrp)}</span>
                                <span className="text-lg font-bold text-green-600">{Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off</span>
                            </>
                        )}
                    </div>
                    
                    {product.freeDelivery !== false && (
                        <div className="mb-6">
                            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                                <span className="mr-2 text-green-600">✓</span> Free Delivery
                            </span>
                        </div>
                    )}
                    
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((v) => (
                                    <button 
                                        key={v.size} 
                                        disabled={v.stock === 0}
                                        onClick={() => setSelectedSize(v.size)}
                                        className={cn(
                                            "w-12 h-12 rounded-xl border text-sm font-medium flex items-center justify-center transition-colors",
                                            selectedSize === v.size ? "border-[#e11d74] bg-[#e11d74]/5 text-[#e11d74]" : "border-gray-300 text-gray-700 hover:border-gray-400",
                                            v.stock === 0 && "opacity-50 cursor-not-allowed bg-gray-50"
                                        )}>
                                        {v.size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-xl h-12">
                            <button onClick={() => setQty(Math.max(1, qty-1))} className="px-4 text-gray-600 hover:text-[#e11d74]">-</button>
                            <span className="w-12 text-center font-medium text-gray-900">{qty}</span>
                            <button onClick={() => setQty(qty+1)} className="px-4 text-gray-600 hover:text-[#e11d74]">+</button>
                        </div>
                        <button onClick={handleAddToCart} className="flex-1 bg-[#e11d74] text-white h-12 rounded-xl font-medium hover:bg-[#c91866] flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                        </button>
                    </div>

                    <div className="prose prose-sm text-gray-600">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                        <p className="whitespace-pre-wrap">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 border-t border-gray-100 pt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Review Form */}
                    <div>
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button 
                                                key={star} 
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className={`text-2xl focus:outline-none ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
                                    <textarea 
                                        rows="3" 
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-[#e11d74] focus:border-[#e11d74]"
                                        placeholder="What did you like or dislike?"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={submittingReview}
                                    className="px-6 py-2 bg-[#e11d74] text-white rounded-xl font-medium hover:bg-[#c91866] disabled:opacity-50"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                                <p className="text-gray-600 mb-4">Please log in to write a review.</p>
                                <a href="/login" className="inline-block px-6 py-2 bg-[#e11d74] text-white rounded-xl font-medium hover:bg-[#c91866]">Log In</a>
                            </div>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-gray-900">{review.user?.name || 'User'}</span>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} className={review.rating >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
                                    <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



