"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminSidebar() {
    const pathname = usePathname();
    const links = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { href: '/admin/banners', label: 'Banners', icon: ImageIcon }
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
            <div className="mb-8 px-4">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            <nav className="space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link key={link.href} href={link.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                                isActive ? "bg-[#e11d74]/10 text-[#e11d74]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
