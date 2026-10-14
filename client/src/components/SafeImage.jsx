"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export default function SafeImage({ src, alt, className, fill, ...props }) {
    const [error, setError] = useState(false);

    if (error || !src) {
        const fillClasses = fill ? "absolute inset-0 w-full h-full" : "";
        return (
            <div className={`bg-gray-200 flex flex-col items-center justify-center ${fillClasses} ${className || ''}`}>
                <ImageIcon className="text-gray-400 w-8 h-8 mb-2" />
                <span className="text-gray-400 text-xs font-medium">No Image</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt || "Product image"}
            className={className}
            fill={fill}
            onError={() => setError(true)}
            {...props}
        />
    );
}
