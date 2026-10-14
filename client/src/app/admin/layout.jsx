"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (user.role !== 'admin') router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return <div className="p-8 text-center">Checking access...</div>;
    }

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] mt-[-64px]"> 
            <AdminSidebar />
            <div className="flex-1 p-8 pt-24 overflow-auto">
                {children}
            </div>
        </div>
    );
}
