"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '../lib/api';

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [banners, setBanners] = useState([]);
    
    useEffect(() => {
        api.get('/banners').then(res => {
            if (res.data.banners && res.data.banners.length > 0) {
                setBanners(res.data.banners);
            }
        }).catch(err => console.error("Error fetching banners:", err));
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);
    
    if (banners.length === 0) return null;

    return (
        <section className="relative w-full h-[400px] md:h-[500px] bg-gray-100 overflow-hidden">
            {banners.map((banner, index) => (
                <div
                    key={banner._id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
                            {banner.title}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl drop-shadow-sm">
                            {banner.subtitle}
                        </p>
                        <Link href={banner.link} className="bg-[#e11d74] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c91866] transition shadow-lg transform hover:scale-105">
                            Shop Now
                        </Link>
                    </div>
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            currentSlide === idx ? 'bg-[#e11d74] w-8' : 'bg-white/70 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
