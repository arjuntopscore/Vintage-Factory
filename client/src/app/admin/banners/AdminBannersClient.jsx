"use client";
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SafeImage from "@/src/components/SafeImage";

export default function AdminBannersClient() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        api.get('/banners/admin').then(res => setBanners(res.data.banners)).catch(console.error);
    }, [refresh]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editing._id) {
                await api.put(`/banners/${editing._id}`, editing);
                toast.success('Banner updated');
            } else {
                await api.post('/banners', editing);
                toast.success('Banner created');
            }
            setEditing(null);
            setRefresh(r => r + 1);
        } catch (error) {
            toast.error('Failed to save banner');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/banners/${id}`);
            toast.success('Banner deleted');
            setRefresh(r => r + 1);
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                <button onClick={() => setEditing({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 })} className="flex items-center px-4 py-2 bg-[#e11d74] text-white rounded-xl text-sm font-medium hover:bg-[#c91866]">
                    <Plus className="w-4 h-4 mr-2" /> Add Banner
                </button>
            </div>

            {editing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl">
                        <h3 className="text-lg font-bold mb-4">{editing._id ? 'Edit Banner' : 'New Banner'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input required value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subtitle</label>
                                <input value={editing.subtitle} onChange={e => setEditing({...editing, subtitle: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input required value={editing.image} onChange={e => setEditing({...editing, image: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Link URL</label>
                                <input value={editing.link} onChange={e => setEditing({...editing, link: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input type="number" value={editing.order} onChange={e => setEditing({...editing, order: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
                                </div>
                                <div className="flex-1 flex items-center mt-6">
                                    <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({...editing, isActive: e.target.checked})} className="mr-2" id="isActive" />
                                    <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 py-2 bg-[#e11d74] text-white rounded-xl text-sm font-medium hover:bg-[#c91866]">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {banners.map(b => (
                            <tr key={b._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-16 w-32 shrink-0 relative bg-gray-100 rounded overflow-hidden">
                                            {b.image && <SafeImage src={b.image} alt="" fill className="object-cover" />}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{b.title}</div>
                                            <div className="text-sm text-gray-500">{b.link}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.order}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {b.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setEditing(b)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(b._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
