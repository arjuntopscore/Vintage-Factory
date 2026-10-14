import { create } from 'zustand';
import { api } from '../lib/api';

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    fetchUser: async () => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, loading: false });
        } catch (error) {
            set({ user: null, loading: false });
        }
    },
    setUser: (user) => set({ user }),
    logout: async () => {
        try {
            await api.post('/auth/logout');
            set({ user: null });
        } catch (error) {
            console.error('Logout failed');
        }
    }
}));
