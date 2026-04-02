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
      <div className="aspect-[3/4] bg-[var(--background-deep)] border border-[var(--gold)]/10 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-[var(--gold)]/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[var(--foreground)]/40 font-editorial">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-[var(--background-deep)] border border-[var(--gold)]/10 overflow-hidden vignette">
        <Image
          src={media[selectedIndex].url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover filter-film"
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)]/80 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-luxury"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)]/80 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-luxury"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--espresso)]/80 backdrop-blur-sm border border-[var(--gold)]/20">
            <span className="text-[var(--gold)] text-xs tracking-wider">
              {selectedIndex + 1} / {media.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square bg-[var(--background-deep)] border overflow-hidden transition-luxury ${
                index === selectedIndex
                  ? "border-[var(--wine)] ring-1 ring-[var(--wine)]"
                  : "border-[var(--gold)]/10 opacity-70 hover:opacity-100 hover:border-[var(--gold)]/30"
              }`}
            >
              <Image
                src={item.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover filter-film"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
