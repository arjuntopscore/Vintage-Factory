export const instant = false;
import ProductDetailClient from './ProductDetailClient';

export default function ProductDetailPage({ params }) {
    return <ProductDetailClient params={params} />;
}
