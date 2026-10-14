"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const fetchUser = useAuthStore(s => s.fetchUser);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', form);
            await fetchUser();
            toast.success('Account created successfully!');
            router.push('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#e11d74] hover:bg-[#c91866] disabled:opacity-50">
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="font-medium text-[#e11d74] hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
}
