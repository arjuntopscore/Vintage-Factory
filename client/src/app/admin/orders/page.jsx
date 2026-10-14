"use client";
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        api.get('/admin/orders?limit=100').then(res => setOrders(res.data.orders)).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(o => (
                            <tr key={o._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {o._id.substring(o._id.length - 8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{o.user?.name}</div>
                                    <div className="text-sm text-gray-500">{o.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatPrice(o.totalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 uppercase tracking-wider">
                                        {o.orderStatus.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/orders/${o._id}`} className="text-[#e11d74] hover:text-[#c91866]">
                                        <Eye className="w-5 h-5 ml-auto" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
