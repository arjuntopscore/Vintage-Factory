"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm({ params }) {
    const router = useRouter();
    const isEdit = true;
    // In React 19 / Next.js 15, params is a Promise. We unwrap it with use()
    // For safety, we conditionally unwrap it if it's a promise, or just use it.
    const resolvedParams = isEdit ? (params instanceof Promise ? use(params) : params) : null;
    const id = isEdit ? resolvedParams.id : null;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        images: [''],
        meeshoUrl: '',
        meeshoPrice: '',
        sellingPrice: '',
        mrp: '',
        freeDelivery: true,
        isActive: true,
        variants: [{ size: '', stock: 0 }]
    });

    const [markupType, setMarkupType] = useState('percent');
    const [markupValue, setMarkupValue] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            api.get(`/products/${id}`).then(res => { // Wait, public route hides meeshoPrice!
                // Actually need to fetch from an admin route or use the existing list!
                // Let's use the list endpoint with a filter.
                return api.get('/admin/products');
            }).then(res => {
                const prod = res.data.products.find(p => p._id === id);
                if (prod) {
                    setForm({
                        title: prod.title,
                        description: prod.description || '',
                        category: prod.category || '',
                        images: prod.images?.length > 0 ? prod.images : [''],
                        meeshoUrl: prod.meeshoUrl || '',
                        meeshoPrice: prod.meeshoPrice || '',
                        sellingPrice: prod.sellingPrice || '',
                        mrp: prod.mrp || '',
                        freeDelivery: prod.freeDelivery !== false,
                        isActive: prod.isActive,
                        variants: prod.variants?.length > 0 ? prod.variants : [{ size: '', stock: 0 }]
                    });
                }
                setFetching(false);
            }).catch(() => {
                toast.error('Failed to load product');
                setFetching(false);
            });
        }
    }, [isEdit, id]);

    // Handle Markup Auto-Fill
    useEffect(() => {
        const mCost = Number(form.meeshoPrice);
        const mVal = Number(markupValue);
        if (mCost > 0 && mVal > 0) {
            let newPrice;
            if (markupType === 'percent') {
                newPrice = mCost * (1 + (mVal / 100));
            } else {
                newPrice = mCost + mVal;
            }
            setForm(f => ({ ...f, sellingPrice: Math.round(newPrice).toString() }));
        }
    }, [markupValue, markupType, form.meeshoPrice]);

    const profit = (Number(form.sellingPrice) || 0) - (Number(form.meeshoPrice) || 0);
    const margin = Number(form.meeshoPrice) > 0 ? ((profit / Number(form.meeshoPrice)) * 100).toFixed(1) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean up empty images and variants
            const payload = {
                ...form,
                images: form.images.filter(img => img.trim() !== ''),
                variants: form.variants.filter(v => v.size.trim() !== ''),
                meeshoPrice: Number(form.meeshoPrice),
                sellingPrice: Number(form.sellingPrice),
                mrp: form.mrp ? Number(form.mrp) : undefined,
                freeDelivery: form.freeDelivery
            };

            if (isEdit) {
                await api.put(`/admin/products/${id}`, payload);
                toast.success('Product updated');
            } else {
                await api.post('/admin/products', payload);
                toast.success('Product created');
            }
            router.push('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center mb-8">
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Info</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2">
                                <option value="">Select Category</option>
                                <option value="Popular">Popular</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home and Kitchen">Home and Kitchen</option>
                                <option value="Bags and Footwear">Bags and Footwear</option>
                                <option value="Watches">Watches</option>
                                <option value="Sports and Fitness">Sports and Fitness</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value === 'true'})} className="w-full border border-gray-300 rounded-xl px-3 py-2">
                                <option value="true">Active (Public)</option>
                                <option value="false">Hidden</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Pricing & Profit</h2>
                    <div className="grid grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-blue-600">Meesho Cost Price</label>
                            <input type="number" required value={form.meeshoPrice} onChange={e => setForm({...form, meeshoPrice: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-blue-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Apply Markup</label>
                            <div className="flex">
                                <select value={markupType} onChange={e => setMarkupType(e.target.value)} className="border border-gray-300 rounded-l-xl px-2 py-2 bg-gray-50 text-sm">
                                    <option value="percent">%</option>
                                    <option value="flat">₹</option>
                                </select>
                                <input type="number" value={markupValue} onChange={e => setMarkupValue(e.target.value)} placeholder="Auto-fill..." className="w-full border border-l-0 border-gray-300 rounded-r-xl px-3 py-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-green-600">Final Selling Price</label>
                            <input type="number" required value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 font-bold" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">MRP (Optional)</label>
                            <input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" placeholder="Must be >= Selling Price" />
                        </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                        <input type="checkbox" id="freeDelivery" checked={form.freeDelivery} onChange={e => setForm({...form, freeDelivery: e.target.checked})} className="mr-2 rounded border-gray-300 text-[#e11d74] focus:ring-[#e11d74]" />
                        <label htmlFor="freeDelivery" className="text-sm font-medium">Free Delivery</label>
                    </div>
                    {form.meeshoPrice && form.sellingPrice && (
                        <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center justify-between border border-green-200">
                            <span className="font-medium">Live Profit Margin:</span>
                            <div className="text-right">
                                <span className="text-xl font-bold">₹{profit}</span>
                                <span className="text-sm ml-2">({margin}%)</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Meesho Source URL (Hidden from public)</label>
                        <input value={form.meeshoUrl} onChange={e => setForm({...form, meeshoUrl: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Images (URLs)</h2>
                    {form.images.map((img, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={img} onChange={e => {
                                const newImgs = [...form.images];
                                newImgs[i] = e.target.value;
                                setForm({...form, images: newImgs});
                            }} placeholder="https://..." className="flex-1 border border-gray-300 rounded-xl px-3 py-2" />
                            <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setForm({...form, images: [...form.images, '']})} className="text-sm font-medium text-[#e11d74] flex items-center"><Plus className="w-4 h-4 mr-1"/> Add another image</button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Sizes & Stock</h2>
                    {form.variants.map((v, i) => (
                        <div key={i} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Size (e.g. S, M, XL)</label>
                                <input value={v.size} onChange={e => {
                                    const newV = [...form.variants];
                                    newV[i].size = e.target.value;
                                    setForm({...form, variants: newV});
                                }} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs text-gray-500 mb-1">Stock</label>
                                <input type="number" value={v.stock} onChange={e => {
                                    const newV = [...form.variants];
                                    newV[i].stock = parseInt(e.target.value) || 0;
                                    setForm({...form, variants: newV});
                                }} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <button type="button" onClick={() => setForm({...form, variants: form.variants.filter((_, idx) => idx !== i)})} className="p-2 mb-1 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setForm({...form, variants: [...form.variants, {size:'', stock:0}]})} className="text-sm font-medium text-[#e11d74] flex items-center"><Plus className="w-4 h-4 mr-1"/> Add variant</button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-[#e11d74] text-white rounded-xl shadow-sm font-medium hover:bg-[#c91866] flex justify-center items-center">
                    <Save className="w-5 h-5 mr-2" /> {isEdit ? 'Save Changes' : 'Create Product'}
                </button>
            </form>
        </div>
    );
}
