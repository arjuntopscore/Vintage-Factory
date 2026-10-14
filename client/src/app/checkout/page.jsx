"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../lib/utils';

export default function Checkout() {
    const { items, getTotal, clearCart } = useCartStore();
    const { user, loading: authLoading } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [address, setAddress] = useState({
        name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please login to continue');
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (items.length === 0) {
        return <div className="p-8 text-center">Your cart is empty.</div>;
    }

    const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (address.phone.length !== 10) return toast.error('Phone must be 10 digits');
        if (address.pincode.length !== 6) return toast.error('Pincode must be 6 digits');

        setLoading(true);
        try {
            // 1. Create Order
            const { data: order } = await api.post('/orders', {
                items,
                shippingAddress: address
            });

            // 2. Create Razorpay Order
            const { data: rzp } = await api.post('/payment/create-order', { orderId: order._id });

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: rzp.amount,
                currency: rzp.currency,
                name: 'Vintage Factory',
                description: 'Order Payment',
                order_id: rzp.id,
                handler: async function (response) {
                    try {
                        await api.post('/payment/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        clearCart();
                        toast.success('Payment successful!');
                        router.push(`/order-success/${order._id}`);
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: address.phone
                },
                theme: { color: '#e11d74' }
            };

            const rzpObj = new window.Razorpay(options);
            rzpObj.on('payment.failed', function () {
                toast.error('Payment failed. Please try again.');
            });
            rzpObj.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <form id="checkout-form" onSubmit={handlePayment} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Address</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-700">Full Name</label>
                                <input required name="name" value={address.name} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Phone</label>
                                <input required name="phone" value={address.phone} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-gray-700">Address Line 1</label>
                                <input required name="line1" value={address.line1} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-gray-700">Address Line 2 (Optional)</label>
                                <input name="line2" value={address.line2} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">City</label>
                                <input required name="city" value={address.city} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">State</label>
                                <input required name="state" value={address.state} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Pincode</label>
                                <input required name="pincode" value={address.pincode} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
                        <ul className="mb-4 text-sm divide-y divide-gray-100">
                            {items.map(i => (
                                <li key={i.productId+i.size} className="py-2 flex justify-between">
                                    <span className="truncate pr-4 text-gray-600">{i.qty} x {i.title}</span>
                                    <span className="font-medium">{formatPrice(i.price * i.qty)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between text-base font-bold text-gray-900 mb-6 pt-4 border-t border-gray-100">
                            <span>Total</span>
                            <span>{formatPrice(getTotal())}</span>
                        </div>
                        <button form="checkout-form" type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-[#e11d74] hover:bg-[#c91866] disabled:opacity-50">
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
