"use client";
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/utils';
import Link from 'next/link';
import SafeImage from "@/src/components/SafeImage";
import { Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
    const { items, updateQty, removeItem, getTotal } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/products" className="inline-block bg-[#e11d74] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#c91866]">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={`${item.productId}-${item.size}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <SafeImage src={item.image || '/placeholder.png'} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button onClick={() => updateQty(item.productId, item.size, Math.max(1, item.qty - 1))} className="p-1.5 text-gray-500 hover:text-[#e11d74]">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                                <button onClick={() => updateQty(item.productId, item.size, item.qty + 1)} className="p-1.5 text-gray-500 hover:text-[#e11d74]">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.productId, item.size)} className="text-red-500 hover:text-red-700 p-2">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-4 text-sm text-gray-600 mb-4 border-b border-gray-100 pb-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatPrice(getTotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 mb-6">
                            <span>Total</span>
                            <span>{formatPrice(getTotal())}</span>
                        </div>
                        <Link href="/checkout" className="w-full block text-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#e11d74] hover:bg-[#c91866]">
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}



