"use client";
import { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';
import SafeImage from "@/src/components/SafeImage";
import { Edit, Trash2, Plus, Upload, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [refresh, setRefresh] = useState(0);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showMarkupModal, setShowMarkupModal] = useState(false);
    const [markupType, setMarkupType] = useState('percent');
    const [markupValue, setMarkupValue] = useState('');
    const fileInput = useRef(null);

    const CATEGORIES = ["All", "Popular", "Electronics", "Home and Kitchen", "Bags and Footwear", "Watches", "Sports and Fitness"];

    useEffect(() => {
        api.get('/admin/products').then(res => setProducts(res.data.products)).catch(console.error);
    }, [refresh]);

    const filteredProducts = activeCategory === 'All' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    const handleDelete = async (id) => {
        if(!confirm('Are you sure?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            setRefresh(r => r + 1);
        } catch(e) {
            toast.error('Failed to delete');
        }
    };

    const handleBulkDelete = async () => {
        if(!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return;
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/products/${id}`)));
            toast.success('Selected products deleted');
            setSelectedIds(new Set());
            setRefresh(r => r + 1);
        } catch(e) {
            toast.error('Failed to delete some products');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            toast.loading('Importing CSV...', { id: 'csv' });
            const res = await api.post('/admin/products/import-csv', formData);
            if (res.data.errors && res.data.errors.length > 0) {
                toast.error(`Created ${res.data.created}. Failed ${res.data.failed}. Check console for errors.`, { id: 'csv', duration: 5000 });
                console.error("CSV Import Errors:", res.data.errors);
            } else {
                toast.success(`Imported ${res.data.created} products successfully.`, { id: 'csv' });
            }
            setRefresh(r => r + 1);
        } catch (error) {
            toast.error('CSV import failed', { id: 'csv' });
        } finally {
            e.target.value = '';
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(new Set(products.map(p => p._id)));
        else setSelectedIds(new Set());
    };

    const handleSelect = (id, checked) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const handleApplyMarkup = async () => {
        const val = Number(markupValue);
        if (!val || val <= 0) return toast.error('Enter a valid value');
        try {
            toast.loading('Applying markup...', { id: 'markup' });
            const res = await api.patch('/admin/products/bulk-markup', {
                productIds: Array.from(selectedIds),
                type: markupType,
                value: val
            });
            toast.success(`Updated ${res.data.updated} products`, { id: 'markup' });
            setShowMarkupModal(false);
            setMarkupValue('');
            setSelectedIds(new Set());
            setRefresh(r => r + 1);
        } catch(e) {
            toast.error('Markup application failed', { id: 'markup' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <div className="flex gap-3">
                    <input type="file" accept=".csv" className="hidden" ref={fileInput} onChange={handleFileUpload} />
                    <button onClick={() => fileInput.current.click()} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" /> Import CSV
                    </button>
                    <Link href="/admin/products/add" className="flex items-center px-4 py-2 bg-[#e11d74] text-white rounded-xl text-sm font-medium hover:bg-[#c91866]">
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Link>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setSelectedIds(new Set()); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeCategory === cat 
                            ? "bg-gray-900 text-white" 
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {selectedIds.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedIds.size} products selected</span>
                    <div className="flex gap-3">
                        <button onClick={handleBulkDelete} className="flex items-center px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium shadow-sm hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                        </button>
                        <button onClick={() => setShowMarkupModal(true)} className="flex items-center px-3 py-1.5 bg-white text-blue-700 border border-blue-300 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-50">
                        <Tag className="w-4 h-4 mr-2" /> Apply Bulk Markup
                    </button>
                    </div>
                </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input type="checkbox" onChange={handleSelectAll} checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length} className="rounded border-gray-300" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meesho Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map(p => {
                            const profit = (p.sellingPrice || 0) - (p.meeshoPrice || 0);
                            const profitPercent = p.meeshoPrice ? ((profit / p.meeshoPrice) * 100).toFixed(1) : 0;
                            return (
                                <tr key={p._id}>
                                    <td className="px-6 py-4">
                                        <input type="checkbox" checked={selectedIds.has(p._id)} onChange={(e) => handleSelect(p._id, e.target.checked)} className="rounded border-gray-300" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 shrink-0 relative bg-gray-100 rounded">
                                                {p.images?.[0] && <SafeImage src={p.images[0]} alt="" fill className="object-cover rounded" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.title}</div>
                                                <div className="text-sm text-gray-500">{p.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatPrice(p.meeshoPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(p.sellingPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="text-green-600 font-bold">{formatPrice(profit)}</span>
                                        <span className="text-gray-400 text-xs ml-2">({profitPercent}%)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                        <Link href={`/admin/products/${p._id}`} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5"/></Link>
                                        <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showMarkupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Apply Bulk Markup</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Markup Type</label>
                            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                                <button onClick={() => setMarkupType('percent')} className={`flex-1 py-2 text-sm font-medium ${markupType === 'percent' ? 'bg-[#e11d74] text-white' : 'bg-gray-50 text-gray-700'}`}>Percent (%)</button>
                                <button onClick={() => setMarkupType('flat')} className={`flex-1 py-2 text-sm font-medium ${markupType === 'flat' ? 'bg-[#e11d74] text-white' : 'bg-gray-50 text-gray-700'}`}>Flat (₹)</button>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Markup Value</label>
                            <input type="number" value={markupValue} onChange={e => setMarkupValue(e.target.value)} placeholder="e.g. 20" className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowMarkupModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">Cancel</button>
                            <button onClick={handleApplyMarkup} className="flex-1 py-2 bg-[#e11d74] text-white rounded-xl text-sm font-medium hover:bg-[#c91866]">Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




