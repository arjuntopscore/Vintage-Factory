import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Vintage Factory</h3>
                    <p className="text-gray-500 text-sm">Your one-stop destination for premium fashion and accessories at unbeatable prices.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link href="/products" className="hover:text-[#e11d74]">All Products</Link></li>
                        <li><Link href="/products?category=clothing" className="hover:text-[#e11d74]">Clothing</Link></li>
                        <li><Link href="/products?category=accessories" className="hover:text-[#e11d74]">Accessories</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link href="#" className="hover:text-[#e11d74]">Contact Us</Link></li>
                        <li><Link href="#" className="hover:text-[#e11d74]">FAQs</Link></li>
                        <li><Link href="#" className="hover:text-[#e11d74]">Track Order</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link href="#" className="hover:text-[#e11d74]">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-[#e11d74]">Return & Refund Policy</Link></li>
                        <li><Link href="#" className="hover:text-[#e11d74]">Shipping Policy</Link></li>
                        <li><Link href="#" className="hover:text-[#e11d74]">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                &copy; 2026 Vintage Factory. All rights reserved.
            </div>
        </footer>
    );
}
