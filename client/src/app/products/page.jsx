export const instant = false;
import ProductsClient from './ProductsClient';
import { connection } from 'next/server';

async function getCategories() {
    try {
        await connection();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/categories`, { cache: 'no-store' });
        const data = await res.json();
        return data.categories || [];
    } catch (e) {
        return ["Popular", "Electronics", "Home and Kitchen", "Bags and Footwear", "Watches", "Sports and Fitness"]; // Fallback
    }
}

export default async function ProductsPage() {
    const categories = await getCategories();
    return <ProductsClient initialCategories={categories} />;
}
