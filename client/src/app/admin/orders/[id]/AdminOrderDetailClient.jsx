"use client";
import { useEffect, useState, use } from 'react';
import { api } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/utils';
import toast from 'react-hot-toast';
import { Copy, ExternalLink, Save } from 'lucide-react';
import SafeImage from "@/src/components/SafeImage";

export default function AdminOrderDetail({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [trackingId, setTrackingId] = useState('');

    useEffect(() => {
        api.get(`/admin/orders/${id}`)
            .then(res => {
                setOrder(res.data);
                setStatus(res.data.orderStatus);
                setTrackingId(res.data.trackingId || '');
            }).catch(console.error);
    }, [id]);

    const handleSave = async () => {
        try {
            await api.patch(`/admin/orders/${order._id}/status`, { orderStatus: status, trackingId });
            toast.success('Order updated successfully');
        } catch (e) {
            toast.error('Failed to update order');
        }
    };

    const copyAddress = () => {
        const addr = order.shippingAddress;
        const text = `${addr.name}\n${addr.phone}\n${addr.line1} ${addr.line2 || ''}\n${addr.city}, ${addr.state} ${addr.pincode}`;
        navigator.clipboard.writeText(text);
        toast.success('Address copied!');
    };

    if (!order) return <div className="p-8">Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Order Details: {order._id}</h1>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <SafeImage src={item.image || '/placeholder.png'} alt="" fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.qty}</p>
                                        <p className="text-sm font-bold text-gray-900 mt-1">Selling: {formatPrice(item.price)}</p>
                                        
                                        {/* Admin specific Meesho Data */}
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-blue-800 font-medium">Meesho Cost: {formatPrice(item.product?.meeshoPrice || 0)}</p>
                                                <p className="text-xs text-green-700 font-bold mt-1">Profit: {formatPrice(item.price - (item.product?.meeshoPrice || 0))}</p>
                                            </div>
                                            {item.product?.meeshoUrl && (
                                                <a href={item.product.meeshoUrl} target="_blank" rel="noreferrer" className="flex items-center px-3 py-1.5 bg-white text-blue-600 rounded-lg shadow-sm text-xs font-medium hover:bg-gray-50 border border-blue-200">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Open on Meesho
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex justify-between items-center">
                            Shipping Address
                            <button onClick={copyAddress} className="text-gray-500 hover:text-[#e11d74] p-1"><Copy className="w-4 h-4" /></button>
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Order</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm">
                                    <option value="placed">Placed</option>
                                    <option value="ordered_on_meesho">Ordered on Meesho</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                                <input value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="e.g. AWB12345" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <button onClick={handleSave} className="w-full flex items-center justify-center px-4 py-2 bg-[#e11d74] text-white rounded-xl shadow-sm text-sm font-medium hover:bg-[#c91866]">
                                <Save className="w-4 h-4 mr-2" /> Save Updates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



