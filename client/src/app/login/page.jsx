"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const fetchUser = useAuthStore(s => s.fetchUser);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            await fetchUser();
            toast.success('Logged in successfully!');
            if (data.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e11d74]/10 to-transparent z-0" />
                <div className="z-10 text-center px-12">
                    <img src="/logo.jpg" alt="Vintage Factory" className="w-64 h-auto mx-auto rounded-3xl shadow-xl mb-8 object-cover" />
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Vintage Factory</h1>
                    <p className="text-lg text-gray-600">Your premium destination for curated vintage and modern styles.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-md w-full">
                    <div className="text-center lg:text-left mb-10">
                        <div className="lg:hidden flex justify-center mb-6">
                            <img src="/logo.jpg" alt="Vintage Factory" className="h-16 w-auto rounded-xl shadow-sm" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="text-gray-500 text-base mt-2">Sign in to your account to continue</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e11d74] focus:border-transparent transition-all" 
                                placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e11d74] focus:border-transparent transition-all" 
                                placeholder="••••••••" />
                        </div>
                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#e11d74] hover:bg-[#c91866] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e11d74] disabled:opacity-50 transition-all">
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account? <Link href="/register" className="font-bold text-[#e11d74] hover:text-[#c91866] hover:underline transition-colors">Create one now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
