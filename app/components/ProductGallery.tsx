"use client";

import { useState } from "react";
import Image from "next/image";

type Media = {
  id: string;
  url: string;
  sort_order: number;
};

type ProductGalleryProps = {
  media: Media[];
  productName: string;
};

export default function ProductGallery({
  media,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center">
        <p className="text-zinc-400 dark:text-zinc-600">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
        <Image
          src={media[selectedIndex].url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-md overflow-hidden ${
                index === selectedIndex
                  ? "ring-2 ring-black dark:ring-white"
                  : "opacity-60 hover:opacity-100"
              } transition-all`}
            >
              <Image
                src={item.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
