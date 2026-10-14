"use client";
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';
import { DollarSign, ShoppingBag, Clock } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({ todayOrders: 0, pendingOrders: 0, totalRevenue: 0 });

    useEffect(() => {
        api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
    }, []);

    const cards = [
        { title: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: 'text-blue-500' },
        { title: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: 'text-orange-500' },
        { title: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-500' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                        <div className={`p-4 rounded-xl bg-gray-50 ${card.color}`}>
                            <card.icon className="w-8 h-8" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
