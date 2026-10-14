"use client";
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';

export default function HomeTabs({ trending, budget, topRated }) {
    const [activeTab, setActiveTab] = useState('trending');
    
    let products = trending;
    if (activeTab === 'budget') products = budget;
    if (activeTab === 'topRated') products = topRated;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b pb-4">
                <div className="flex space-x-6 overflow-x-auto no-scrollbar w-full md:w-auto mb-4 md:mb-0">
                    <button 
                        onClick={() => setActiveTab('trending')}
                        className={`text-lg font-bold whitespace-nowrap transition-colors ${activeTab === 'trending' ? 'text-[#e11d74] border-b-2 border-[#e11d74] pb-1' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Trending Now
                    </button>
                    <button 
                        onClick={() => setActiveTab('budget')}
                        className={`text-lg font-bold whitespace-nowrap transition-colors ${activeTab === 'budget' ? 'text-[#e11d74] border-b-2 border-[#e11d74] pb-1' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Budget Buys
                    </button>
                    <button 
                        onClick={() => setActiveTab('topRated')}
                        className={`text-lg font-bold whitespace-nowrap transition-colors ${activeTab === 'topRated' ? 'text-[#e11d74] border-b-2 border-[#e11d74] pb-1' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Top Rated
                    </button>
                </div>
                
                <Link href="/products" className="text-sm font-bold text-[#e11d74] hover:underline bg-[#e11d74]/10 px-4 py-2 rounded-full shrink-0">
                    View All
                </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}
