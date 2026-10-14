"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { api } from '../../lib/api';

const SORT_OPTIONS = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price (Low to High)', value: 'priceAsc' },
    { label: 'Price (High to Low)', value: 'priceDesc' },
    { label: 'Top Rated', value: 'rating' }
];

export default function ProductsClient({ initialCategories = [] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    // UI state
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Filter values from URL
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const minRating = searchParams.get('minRating') || '';
    const size = searchParams.get('size') || '';
    const sort = searchParams.get('sort') || 'relevance';

    // Local form state for filters
    const [filters, setFilters] = useState({ category, minPrice, maxPrice, minRating, size });

    // Infinite scroll observer
    const observer = useRef();
    const lastProductRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    // Fetch initial or filter changed
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }, [q, category, minPrice, maxPrice, minRating, size, sort]);

    // Fetch on page change
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
        }
    }, [page]);

    const fetchProducts = async (pageNum, isNewFilter) => {
        if (isNewFilter) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams();
            if (q) params.append('q', q);
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minRating) params.append('minRating', minRating);
            if (size) params.append('size', size);
            if (sort) params.append('sort', sort);
            params.append('page', pageNum);
            params.append('limit', 20);

            const res = await api.get(`/products?${params.toString()}`);
            if (isNewFilter) {
                setProducts(res.data.products);
            } else {
                setProducts(prev => [...prev, ...res.data.products]);
            }
            setHasMore(res.data.hasMore);
        } catch (e) {
            console.error("Error fetching products", e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const updateUrl = (newParams) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`/products?${params.toString()}`);
    };

    const handleApplyFilters = () => {
        updateUrl(filters);
        setShowMobileFilters(false);
    };

    const handleClearFilters = () => {
        const newFilters = { category: '', minPrice: '', maxPrice: '', minRating: '', size: '' };
        setFilters(newFilters);
        updateUrl(newFilters);
        setShowMobileFilters(false);
    };

    const handleSortChange = (e) => {
        updateUrl({ sort: e.target.value });
    };

    const FilterSidebar = () => (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                    {initialCategories.map(cat => (
                        <label key={cat} className="flex items-center">
                            <input 
                                type="radio" 
                                name="category" 
                                checked={filters.category === cat}
                                onChange={() => setFilters({...filters, category: cat})}
                                className="text-[#e11d74] focus:ring-[#e11d74]"
                            />
                            <span className="ml-2 text-sm text-gray-600">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
                <div className="flex gap-2 items-center">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={e => setFilters({...filters, minPrice: e.target.value})}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                    {[4, 3].map(rating => (
                        <label key={rating} className="flex items-center">
                            <input 
                                type="radio" 
                                name="rating"
                                checked={filters.minRating === String(rating)}
                                onChange={() => setFilters({...filters, minRating: String(rating)})}
                                className="text-[#e11d74] focus:ring-[#e11d74]"
                            />
                            <span className="ml-2 text-sm text-gray-600">{rating}★ & above</span>
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="pt-4 border-t flex gap-3">
                <button onClick={handleClearFilters} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded">Clear</button>
                <button onClick={handleApplyFilters} className="flex-1 py-2 text-sm font-medium text-white bg-[#e11d74] rounded hover:bg-[#c91866]">Apply</button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Sticky Top Bar */}
            <div className="sticky top-[64px] z-30 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden flex items-center text-sm font-medium text-gray-700"
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                    </button>
                    <div className="hidden lg:block text-sm font-medium text-gray-700">
                        {products.length} Products Found
                    </div>
                    
                    <div className="flex items-center ml-auto">
                        <span className="text-sm text-gray-500 mr-2 hidden sm:block">Sort by:</span>
                        <div className="relative">
                            <select 
                                value={sort} 
                                onChange={handleSortChange}
                                className="appearance-none bg-transparent pl-3 pr-8 py-1 text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 mt-4">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0 bg-white p-5 rounded-md shadow-sm border border-gray-100 h-fit sticky top-[140px]">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="font-bold text-lg">Filters</h2>
                        {(category || minPrice || maxPrice || minRating || size) && (
                            <button onClick={handleClearFilters} className="text-xs text-[#e11d74] font-medium hover:underline">Clear All</button>
                        )}
                    </div>
                    <FilterSidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-md shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[40vh]">
                            <img src="/placeholder.png" alt="Empty" className="w-32 h-32 opacity-20 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-6 max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <button onClick={handleClearFilters} className="px-6 py-2 bg-[#e11d74] text-white rounded font-medium hover:bg-[#c91866] transition-colors">
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                {products.map((product, index) => {
                                    if (products.length === index + 1) {
                                        return <div ref={lastProductRef} key={product._id}><ProductCard product={product} /></div>;
                                    } else {
                                        return <ProductCard key={product._id} product={product} />;
                                    }
                                })}
                            </div>
                            
                            {loadingMore && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-4">
                                    {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
                                </div>
                            )}
                            
                            {!hasMore && products.length > 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm font-medium">
                                    You've reached the end!
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Mobile Bottom Sheet for Filters */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
                        <div className="flex items-center justify-between mb-4 border-b pb-3">
                            <h2 className="font-bold text-lg">Filters</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="p-1 text-gray-500"><X className="w-5 h-5"/></button>
                        </div>
                        <FilterSidebar />
                    </div>
                </div>
            )}
        </div>
    );
}
