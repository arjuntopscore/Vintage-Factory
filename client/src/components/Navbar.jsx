"use client";
import Link from 'next/link';
import { ShoppingCart, User, Search, LogOut, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function Navbar() {
    const { items } = useCartStore();
    const { user, logout, fetchUser } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        fetchUser();
        // Fetch categories for the strip
        api.get('/products/categories')
            .then(res => {
                if(res.data.categories) setCategories(res.data.categories);
            }).catch(console.error);
    }, [fetchUser]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.jpg" alt="Vintage Factory Logo" className="h-10 w-auto rounded-lg object-contain" />
                            <span className="text-2xl font-bold text-gray-900 tracking-tight hidden sm:block">
                                Vintage Factory
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const q = e.target.search.value;
                            if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
                        }} className="relative w-full">
                            <input 
                                type="text" 
                                name="search"
                                placeholder="Search products..." 
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e11d74] focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <button type="submit" className="hidden">Search</button>
                        </form>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link href="/cart" className="relative text-gray-600 hover:text-[#e11d74] transition">
                            <ShoppingCart className="h-6 w-6" />
                            {mounted && items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#e11d74] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>

                        {mounted && user ? (
                            <div className="relative group">
                                <button className="flex items-center text-gray-600 hover:text-[#e11d74] transition">
                                    <User className="h-6 w-6" />
                                </button>
                                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    {user.role === 'admin' && (
                                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#e11d74]">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#e11d74]">
                                        <Package className="w-4 h-4 mr-2" /> My Orders
                                    </Link>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#e11d74]">
                                        <LogOut className="w-4 h-4 mr-2" /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            mounted && (
                                <Link href="/login" className="text-gray-600 hover:text-[#e11d74] font-medium transition">
                                    Login
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
            
            {/* Category Strip */}
            <div className="bg-white border-t border-gray-100 overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ul className="flex space-x-8 py-2 text-sm font-medium text-gray-600">
                        {categories.map(cat => (
                            <li key={cat} className="shrink-0">
                                <Link href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-[#e11d74] transition whitespace-nowrap">
                                    {cat}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
