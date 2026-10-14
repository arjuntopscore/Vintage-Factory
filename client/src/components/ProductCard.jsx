"use client";
import SafeImage from "./SafeImage";
import Link from 'next/link';
import { formatPrice } from '../lib/utils';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlist.includes(product._id)) {
            setIsWishlisted(true);
        }
    }, [product._id]);

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (isWishlisted) {
            const newWishlist = wishlist.filter(id => id !== product._id);
            localStorage.setItem('wishlist', JSON.stringify(newWishlist));
            setIsWishlisted(false);
        } else {
            wishlist.push(product._id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            setIsWishlisted(true);
        }
    };

    const hasMrp = product.mrp && product.mrp > product.sellingPrice;
    const discount = hasMrp ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;
    
    // Check if second image exists
    const displayImage = (isHovered && product.images?.length > 1) ? product.images[1] : product.images?.[0];

    return (
        <Link 
            href={`/products/${product.slug}`} 
            className="group block bg-white rounded-md hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                <SafeImage 
                    src={displayImage || ''} 
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <button 
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors z-10"
                >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#e11d74] text-[#e11d74]' : 'text-gray-500'}`} />
                </button>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
                <h3 className="text-sm text-gray-800 line-clamp-1 leading-snug">{product.title}</h3>
                
                <div className="flex items-baseline flex-wrap gap-1.5">
                    <span className="text-base font-semibold text-gray-900">{formatPrice(product.sellingPrice)}</span>
                    {hasMrp && (
                        <>
                            <span className="text-xs text-gray-500 line-through">{formatPrice(product.mrp)}</span>
                            <span className="text-xs font-bold text-green-600">{discount}% off</span>
                        </>
                    )}
                </div>
                
                {product.freeDelivery !== false && (
                    <div>
                        <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-medium px-1.5 py-0.5 rounded">
                            Free Delivery
                        </span>
                    </div>
                )}
                
                {product.ratingCount > 0 && (
                    <div className="flex items-center">
                        <div className="flex items-center bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                            {product.ratingAverage?.toFixed(1)} <span className="ml-0.5 text-[9px]">★</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-1.5">({product.ratingCount})</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 animate-pulse">
            <div className="aspect-square w-full bg-gray-200"></div>
            <div className="p-2 flex flex-col gap-1.5 mt-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    );
}
