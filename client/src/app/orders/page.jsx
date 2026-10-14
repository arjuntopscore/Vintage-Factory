"use client";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import SafeImage from "@/src/components/SafeImage";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/my')
            .then(res => setOrders(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;
    if (orders.length === 0) return <div className="p-8 text-center">No orders found.</div>;

    const getStatusColor = (status) => {
        const colors = {
            placed: 'bg-blue-100 text-blue-800',
            ordered_on_meesho: 'bg-purple-100 text-purple-800',
            shipped: 'bg-orange-100 text-orange-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                                <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item._id} className="flex gap-4">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <SafeImage src={item.image || '/placeholder.png'} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.qty}</p>
                                        <p className="text-sm font-medium mt-1">{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div>
                                {order.trackingId && <p className="text-sm text-gray-600">Tracking ID: <span className="font-medium">{order.trackingId}</span></p>}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



