import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default async function OrderSuccess({ params }) {
    const { id } = await params;
    return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
            <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you for your purchase. Your order ID is <strong>{id}</strong>.</p>
                <div className="space-x-4">
                    <Link href="/orders" className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-50">
                        View Orders
                    </Link>
                    <Link href="/products" className="inline-block bg-[#e11d74] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#c91866]">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
