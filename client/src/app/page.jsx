export const instant = false;
import Link from "next/link";
import { 
    ShieldCheck, RefreshCw, HandCoins, 
    Smartphone, Watch, Shirt, ShoppingBag, 
    Utensils, Dumbbell, Sparkles, Gem, BookOpen,
    Monitor, Headset, Footprints
} from "lucide-react";
import HeroSlider from "../components/HeroSlider";
import HomeTabs from "./HomeTabs";
import { connection } from 'next/server';

async function fetchProducts(sort) {
    try {
        await connection();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?limit=8&sort=${sort}`, { cache: 'no-store' });
        const data = await res.json();
        return data.products || [];
    } catch (e) {
        return [];
    }
}

async function fetchCategories() {
    try {
        await connection();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/categories`, { cache: 'no-store' });
        const data = await res.json();
        return data.categories || [];
    } catch (e) {
        return [];
    }
}

const getCategoryIcon = (catName) => {
    const name = (catName || '').toLowerCase();
    const iconClass = "w-8 h-8 md:w-10 md:h-10 text-gray-500 group-hover:text-[#e11d74] transition-colors";
    
    if (name.includes('electronic') || name.includes('mobile') || name.includes('phone')) return <Smartphone className={iconClass} />;
    if (name.includes('watch')) return <Watch className={iconClass} />;
    if (name.includes('shirt') || name.includes('cloth') || name.includes('apparel') || name.includes('fashion')) return <Shirt className={iconClass} />;
    if (name.includes('home') || name.includes('kitchen') || name.includes('decor')) return <Utensils className={iconClass} />;
    if (name.includes('sport') || name.includes('fitness') || name.includes('gym')) return <Dumbbell className={iconClass} />;
    if (name.includes('beauty') || name.includes('makeup') || name.includes('cosmetic')) return <Sparkles className={iconClass} />;
    if (name.includes('jewel')) return <Gem className={iconClass} />;
    if (name.includes('book')) return <BookOpen className={iconClass} />;
    if (name.includes('foot') || name.includes('shoe') || name.includes('sneaker')) return <Footprints className={iconClass} />;
    if (name.includes('bag') || name.includes('luggage') || name.includes('purse')) return <ShoppingBag className={iconClass} />;
    if (name.includes('computer') || name.includes('laptop') || name.includes('pc')) return <Monitor className={iconClass} />;
    if (name.includes('audio') || name.includes('headphone') || name.includes('sound')) return <Headset className={iconClass} />;
    
    return <ShoppingBag className={iconClass} />;
};

export default async function Home() {
    const trending = await fetchProducts('newest');
    const budget = await fetchProducts('priceAsc');
    const topRated = await fetchProducts('rating');
    const categories = await fetchCategories();

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <HeroSlider />

            {/* Trust Row */}
            <section className="bg-white border-b border-gray-100 py-6 shadow-sm relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-[#e11d74] mb-2" />
                            <h4 className="font-bold text-xs md:text-sm text-gray-900">7 Days Return</h4>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <HandCoins className="w-6 h-6 md:w-8 md:h-8 text-[#e11d74] mb-2" />
                            <h4 className="font-bold text-xs md:text-sm text-gray-900">Cash on Delivery</h4>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#e11d74] mb-2" />
                            <h4 className="font-bold text-xs md:text-sm text-gray-900">Secure Payment</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Tiles */}
            {categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 px-2 border-l-4 border-[#e11d74]">Shop by Category</h2>
                    <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4">
                        {categories.map((cat, i) => (
                            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="group flex flex-col items-center shrink-0 w-24 md:w-28">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-50 shadow-inner flex items-center justify-center overflow-hidden mb-3 border-2 border-transparent group-hover:border-[#e11d74] group-hover:bg-pink-50 transition-colors">
                                    {getCategoryIcon(cat)}
                                </div>
                                <span className="text-xs md:text-sm font-medium text-center text-gray-700 group-hover:text-[#e11d74] line-clamp-2">{cat}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Tabbed Products Section */}
            <HomeTabs trending={trending} budget={budget} topRated={topRated} />
            
        </div>
    );
}

