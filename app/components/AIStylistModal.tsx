"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type SearchMode = "text" | "image";

type Product = {
  id: string;
  name: string;
  price_per_rental: number;
  designer: { id: string; name: string } | null;
  media: { id: string; url: string; sort_order: number }[];
  tier_required: number;
  ai_description?: string;
  description?: string;
  category?: string;
  era?: string;
  color?: string;
  material?: string;
  style?: 'masculine' | 'feminine' | 'unisex';
};

type UserBodyProfile = {
  front_photo_url: string | null;
  side_photo_url: string | null;
  height_cm: number | null;
  skin_tone: string | null;
  hair_color: string | null;
  body_type: string | null;
  gender_identity: 'male' | 'female' | 'nonbinary' | null;
  presentation_style_preference: ('masculine' | 'feminine')[] | null;
};

type FiltersApplied = {
  categories: string[];
  colors: string[];
  eras: string[];
  materials: string[];
  keywords: string[];
};

type AIStylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userTier: number;
};

export default function AIStylistModal({ isOpen, onClose, userTier }: AIStylistModalProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [outfitBreakdown, setOutfitBreakdown] = useState<string | null>(null);
  const [filtersApplied, setFiltersApplied] = useState<FiltersApplied | null>(null);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null);
  const [outfitError, setOutfitError] = useState("");

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Selection state for outfit pairing - one item per category
  const [selectedItems, setSelectedItems] = useState<{ [category: string]: Product }>({});
  const [isSelectingForOutfit, setIsSelectingForOutfit] = useState(false);

  // Personalized model state
  const [usePersonalizedModel, setUsePersonalizedModel] = useState(false);
  const [userBodyProfile, setUserBodyProfile] = useState<UserBodyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Check if user has a complete body profile
  const hasCompleteProfile = userBodyProfile && (
    userBodyProfile.skin_tone ||
    userBodyProfile.body_type ||
    userBodyProfile.hair_color ||
    userBodyProfile.front_photo_url
  );

  // Fetch user's body profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/body-profile");
        if (res.ok) {
          const data = await res.json();
          setUserBodyProfile(data.profile);
          // Auto-enable personalized model if profile is set up
          if (data.profile?.skin_tone || data.profile?.body_type) {
            setUsePersonalizedModel(true);
          }
        }
      } catch (error) {
        console.error("Error fetching body profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  // Check if results contain multiple categories (for outfit visualization)
  const uniqueCategories = [...new Set(results.map(p => p.category).filter(Boolean))] as string[];
  const hasMultipleCategories = uniqueCategories.length >= 2;

  // Get selected items count
  const selectedCount = Object.keys(selectedItems).length;
  const canGenerateOutfit = selectedCount >= 2;

  // Handle selecting/deselecting a product for outfit
  const handleSelectForOutfit = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const category = product.category;
    if (!category) return;

    setSelectedItems(prev => {
      // If this exact product is already selected, deselect it
      if (prev[category]?.id === product.id) {
        const newSelected = { ...prev };
        delete newSelected[category];
        return newSelected;
      }
      // Otherwise, select this product for its category (replaces any previous selection)
      return { ...prev, [category]: product };
    });
  };

  const handleGenerateOutfit = async () => {
    if (!canGenerateOutfit) return;

    setIsGeneratingOutfit(true);
    setOutfitError("");
    setOutfitImageUrl(null);

    try {
      // Use selected items for outfit generation with detailed info
      const selectedProducts = Object.values(selectedItems);
      const productImages = selectedProducts.map(p => ({
        name: p.name,
        category: p.category || "item",
        era: p.era,
        color: p.color,
        material: p.material,
        style: p.style,
        description: p.ai_description || p.description,
        designerName: p.designer?.name,
        imageUrl: p.media?.[0]?.url,
      }));

      const res = await fetch("/api/generate-outfit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          productImages,
          styleVibe: interpretation,
          usePersonalizedModel: usePersonalizedModel && hasCompleteProfile,
          userGenderIdentity: userBodyProfile?.gender_identity,
          userStylePreference: userBodyProfile?.presentation_style_preference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate outfit image");
      }

      setOutfitImageUrl(data.imageUrl);
      setIsSelectingForOutfit(false); // Close selection mode after generating
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setOutfitError(errorMessage);
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  const handleSearch = async () => {
    if (query.trim().length < 3) {
      setError("Please describe what you're looking for in more detail");
      return;
    }

    setIsSearching(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userTier,
          userStylePreference: userBodyProfile?.presentation_style_preference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.products);
      setInterpretation(data.interpretation);
      setOccasion(data.occasion);
      setFiltersApplied(data.filters_applied);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Upload to our upload endpoint
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedImage(data.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleImageSearch = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first");
      return;
    }

    setIsSearching(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai-stylist/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          userTier,
          userStylePreference: userBodyProfile?.presentation_style_preference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.products);
      setInterpretation(data.interpretation);
      setOutfitBreakdown(data.outfit_breakdown);
      setOccasion(null);
      setFiltersApplied(data.filters_applied);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setSearchMode("text");
    setQuery("");
    setResults([]);
    setInterpretation(null);
    setOccasion(null);
    setOutfitBreakdown(null);
    setFiltersApplied(null);
    setError("");
    setHasSearched(false);
    setOutfitImageUrl(null);
    setOutfitError("");
    setSelectedItems({});
    setIsSelectingForOutfit(false);
    setUploadedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-[var(--espresso)]/80 backdrop-blur-sm" />

      <div
        className="relative bg-[var(--background)] border border-[var(--gold)]/20 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--gold)]/10 bg-[var(--background-warm)]">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg className="w-6 h-6 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <h2 className="font-display text-2xl text-[var(--foreground)]">AI Stylist</h2>
            </div>
            <p className="font-editorial text-[var(--foreground)]/60 text-sm max-w-lg mx-auto">
              Tell us the vibe, the reference, or the moment. We&apos;ll pull the perfect archive pieces.
            </p>
          </div>
        </div>

        {/* Search Mode Toggle */}
        <div className="px-6 pt-4 border-b border-[var(--gold)]/10">
          <div className="flex gap-1 p-1 bg-[var(--background-warm)] border border-[var(--gold)]/10 w-fit mx-auto mb-4">
            <button
              onClick={() => setSearchMode("text")}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all ${
                searchMode === "text"
                  ? "bg-[var(--wine)] text-[#F5F0E8]"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Describe It
              </span>
            </button>
            <button
              onClick={() => setSearchMode("image")}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all ${
                searchMode === "image"
                  ? "bg-[var(--wine)] text-[#F5F0E8]"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Inspo
              </span>
            </button>
          </div>
        </div>

        {/* Search Input - Text Mode */}
        {searchMode === "text" && (
          <div className="p-6 border-b border-[var(--gold)]/10">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Try: "mob wife energy for a dinner date" or "giving Penny Lane but make it 2024" or "quiet luxury for meeting his parents" or "I want to look like the main character at Art Basel"`}
                rows={2}
                className="w-full px-4 py-3 pr-32 bg-[var(--background-warm)] border border-[var(--gold)]/20 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors resize-none placeholder:text-[var(--foreground)]/40"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || query.trim().length < 3}
                className="absolute bottom-3 right-3 px-4 py-2 bg-[var(--wine)] text-[#F5F0E8] text-xs tracking-[0.1em] uppercase hover:bg-[var(--espresso)] transition-luxury disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find Pieces"
                )}
              </button>
            </div>
            {error && <p className="text-sm text-[var(--wine)] mt-2">{error}</p>}
          </div>
        )}

        {/* Search Input - Image Mode */}
        {searchMode === "image" && (
          <div className="p-6 border-b border-[var(--gold)]/10">
            {!uploadedImage ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleFileDrop}
                onClick={() => imageInputRef.current?.click()}
                className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[var(--gold)] bg-[var(--gold)]/5"
                    : "border-[var(--gold)]/30 hover:border-[var(--gold)]/50 hover:bg-[var(--background-warm)]"
                }`}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {isUploading ? (
                  <>
                    <div className="w-10 h-10 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-editorial text-[var(--foreground)]/70">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 mx-auto text-[var(--gold)]/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-editorial text-[var(--foreground)]/70 mb-2">
                      {isDragging ? "Drop your inspo here" : "Upload outfit inspiration"}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      Drop an image or click to browse • We&apos;ll find similar pieces in our archive
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-4 items-start">
                {/* Uploaded image preview */}
                <div className="relative w-32 h-40 bg-[var(--background-deep)] border border-[var(--gold)]/20 overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImage}
                    alt="Uploaded inspiration"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 right-1 w-6 h-6 bg-[var(--espresso)]/80 text-white flex items-center justify-center hover:bg-[var(--wine)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search prompt */}
                <div className="flex-1">
                  <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)] mb-2">
                    Inspiration Uploaded
                  </p>
                  <p className="font-editorial text-sm text-[var(--foreground)]/70 mb-4">
                    We&apos;ll analyze this outfit and find similar vintage pieces from our archive to help you recreate the look.
                  </p>
                  <button
                    onClick={handleImageSearch}
                    disabled={isSearching}
                    className="px-6 py-3 bg-[var(--wine)] text-[#F5F0E8] text-xs tracking-[0.1em] uppercase hover:bg-[var(--espresso)] transition-luxury disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Find Similar Pieces
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-[var(--wine)] mt-2">{error}</p>}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
          {/* Interpretation */}
          {(interpretation || outfitBreakdown) && (
            <div className="mb-6 p-5 bg-gradient-to-br from-[var(--background-warm)] to-[var(--background)] border border-[var(--gold)]/20 shadow-archival">
              {outfitBreakdown && (
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[var(--gold)]/10">
                  <svg className="w-5 h-5 text-[var(--gold)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)] mb-2">What We See</p>
                    <p className="font-editorial text-[var(--foreground)]/80 leading-relaxed">
                      {outfitBreakdown}
                    </p>
                  </div>
                </div>
              )}

              {interpretation && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--gold)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)] mb-2">The Vibe</p>
                    <p className="font-editorial text-[var(--foreground)] text-lg leading-relaxed">
                      {interpretation}
                    </p>
                  </div>
                </div>
              )}

              {occasion && (
                <div className="mt-4 pt-3 border-t border-[var(--gold)]/10">
                  <p className="text-xs text-[var(--foreground)]/50">
                    <span className="text-[var(--gold)]">Perfect for:</span> {occasion}
                  </p>
                </div>
              )}

              {filtersApplied && (filtersApplied.eras.length > 0 || filtersApplied.categories.length > 0 || filtersApplied.keywords.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filtersApplied.eras.map((era) => (
                    <span key={era} className="px-2.5 py-1 text-xs bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 font-medium">
                      {era}
                    </span>
                  ))}
                  {filtersApplied.categories.map((cat) => (
                    <span key={cat} className="px-2.5 py-1 text-xs bg-[var(--wine)]/10 text-[var(--wine)] border border-[var(--wine)]/20 capitalize font-medium">
                      {cat}
                    </span>
                  ))}
                  {filtersApplied.materials.map((mat) => (
                    <span key={mat} className="px-2.5 py-1 text-xs bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border border-[var(--foreground)]/10 capitalize">
                      {mat}
                    </span>
                  ))}
                  {filtersApplied.keywords.slice(0, 4).map((keyword) => (
                    <span key={keyword} className="px-2.5 py-1 text-xs bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20 italic">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outfit Visualization Section */}
          {hasMultipleCategories && !isSearching && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[var(--gold)]/5 to-[var(--wine)]/5 border border-[var(--gold)]/20">
              {!isSelectingForOutfit ? (
                // Initial state - prompt to select items
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)] mb-1">
                      Create Your Look
                    </p>
                    <p className="font-editorial text-sm text-[var(--foreground)]/70">
                      Found {uniqueCategories.join(", ")} — select pieces to visualize together
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSelectingForOutfit(true)}
                    className="px-5 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--wine)] text-[#F5F0E8] text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Select Items to Match
                  </button>
                </div>
              ) : (
                // Selection mode active
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)] mb-1">
                        Select Your Pieces
                      </p>
                      <p className="font-editorial text-sm text-[var(--foreground)]/70">
                        Choose 1 item per category (min 2 to generate)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSelectingForOutfit(false);
                        setSelectedItems({});
                      }}
                      className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Selected items preview */}
                  {selectedCount > 0 && (
                    <div className="mb-4 p-3 bg-[var(--background)] border border-[var(--gold)]/10">
                      <p className="text-xs text-[var(--foreground)]/50 mb-2">Selected ({selectedCount}):</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedItems).map(([category, product]) => (
                          <div key={category} className="flex items-center gap-2 px-2 py-1 bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-xs">
                            <span className="text-[var(--gold)] capitalize">{category}:</span>
                            <span className="text-[var(--foreground)]/70 truncate max-w-[150px]">{product.name}</span>
                            <button
                              onClick={() => {
                                setSelectedItems(prev => {
                                  const newSelected = { ...prev };
                                  delete newSelected[category];
                                  return newSelected;
                                });
                              }}
                              className="text-[var(--foreground)]/40 hover:text-[var(--wine)]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalized Model Toggle */}
                  <div className="mb-4 p-3 bg-[var(--background)] border border-[var(--gold)]/10 rounded">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-medium text-[var(--foreground)]">
                            Personalized Model
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--foreground)]/50">
                          {hasCompleteProfile
                            ? "Generate with a model matching your body type, skin tone, and hair"
                            : "Set up your body profile to see how outfits look on you"}
                        </p>
                      </div>
                      {hasCompleteProfile ? (
                        <button
                          onClick={() => setUsePersonalizedModel(!usePersonalizedModel)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            usePersonalizedModel ? "bg-[var(--gold)]" : "bg-[var(--foreground)]/20"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                              usePersonalizedModel ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href="/profile/settings"
                          onClick={onClose}
                          className="text-[10px] px-3 py-1.5 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 transition-colors whitespace-nowrap"
                        >
                          Set Up Profile
                        </Link>
                      )}
                    </div>
                    {usePersonalizedModel && hasCompleteProfile && (
                      <div className="mt-2 pt-2 border-t border-[var(--gold)]/10 flex items-center gap-2 text-[10px] text-[var(--gold)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Using your profile: {userBodyProfile?.body_type || ""} {userBodyProfile?.skin_tone ? `• ${userBodyProfile.skin_tone}` : ""} {userBodyProfile?.hair_color ? `• ${userBodyProfile.hair_color} hair` : ""}
                      </div>
                    )}
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerateOutfit}
                    disabled={!canGenerateOutfit || isGeneratingOutfit}
                    className="w-full px-5 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--wine)] text-[#F5F0E8] text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingOutfit ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        {usePersonalizedModel && hasCompleteProfile ? "Generating Your Personalized Look..." : "Generating Your Look..."}
                      </>
                    ) : !canGenerateOutfit ? (
                      `Select at least 2 items (${selectedCount}/2)`
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {usePersonalizedModel && hasCompleteProfile
                          ? `Generate Personalized Look (${selectedCount} Pieces)`
                          : `Generate Outfit with ${selectedCount} Pieces`}
                      </>
                    )}
                  </button>
                </div>
              )}
              {outfitError && (
                <p className="text-sm text-[var(--wine)] mt-3">{outfitError}</p>
              )}
            </div>
          )}

          {/* Generated Outfit Image */}
          {outfitImageUrl && (
            <div className="mb-6 p-4 bg-[var(--background-warm)] border border-[var(--gold)]/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)]">
                  AI-Generated Outfit Visualization
                </p>
                {usePersonalizedModel && hasCompleteProfile && (
                  <span className="flex items-center gap-1 text-[10px] text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personalized
                  </span>
                )}
              </div>
              <div className="relative aspect-[3/4] max-w-md mx-auto bg-[var(--background-deep)] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outfitImageUrl}
                  alt="AI-generated outfit visualization"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-xs text-[var(--foreground)]/40 mt-3 font-editorial italic">
                {usePersonalizedModel && hasCompleteProfile
                  ? "Personalized visualization based on your body profile"
                  : "AI-generated visualization based on your style request"}
              </p>
              {/* Regenerate button */}
              <div className="flex justify-center mt-4 gap-3">
                <button
                  onClick={() => {
                    setOutfitImageUrl(null);
                    setIsSelectingForOutfit(true);
                  }}
                  className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    setOutfitImageUrl(null);
                    setSelectedItems({});
                    setIsSelectingForOutfit(false);
                  }}
                  className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New Outfit
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && results.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-[var(--foreground)]/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-editorial text-[var(--foreground)]/60 mb-2">
                No pieces found matching that description.
              </p>
              <p className="text-sm text-[var(--foreground)]/40">
                Try being more specific about colors, eras, or styles.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin mx-auto mb-4" />
              <p className="font-editorial text-[var(--foreground)]/60 mb-2">
                Decoding your vibe...
              </p>
              <p className="text-xs text-[var(--foreground)]/40 italic">
                Reading the assignment, pulling from the archive
              </p>
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 && !isSearching && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50">
                  {results.length} piece{results.length !== 1 ? "s" : ""} found
                </p>
                {isSelectingForOutfit && (
                  <p className="text-xs text-[var(--gold)] italic">
                    Click items to select for outfit
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((product) => {
                  const sortedMedia = product.media?.sort((a, b) => a.sort_order - b.sort_order) || [];
                  const featuredImage = sortedMedia[0];
                  const isSelected = product.category && selectedItems[product.category]?.id === product.id;
                  const categoryHasSelection = product.category && selectedItems[product.category] && selectedItems[product.category].id !== product.id;

                  // In selection mode, clicking selects the item. Otherwise, it's a link.
                  const content = (
                    <>
                      <div className={`relative aspect-[3/4] bg-[var(--background-deep)] overflow-hidden mb-2 border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/30"
                          : isSelectingForOutfit && categoryHasSelection
                            ? "border-[var(--foreground)]/5 opacity-50"
                            : "border-[var(--gold)]/10"
                      }`}>
                        {featuredImage ? (
                          <Image
                            src={featuredImage.url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[var(--foreground)]/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {/* Selection indicator */}
                        {isSelectingForOutfit && (
                          <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[var(--gold)] border-[var(--gold)]"
                              : "bg-white/80 border-[var(--gold)]/50"
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        {/* Category badge in selection mode */}
                        {isSelectingForOutfit && product.category && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-[var(--espresso)]/80 text-[var(--gold)] text-[10px] tracking-wider uppercase">
                            {product.category}
                          </div>
                        )}
                        {/* Tier badge */}
                        {product.tier_required > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-[var(--espresso)]/80 text-[var(--gold)] text-[10px] tracking-wider uppercase">
                            Tier {product.tier_required}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--gold)] tracking-[0.15em] uppercase truncate">
                        {product.designer?.name || "Archive"}
                      </p>
                      <p className="font-editorial text-sm text-[var(--foreground)] truncate group-hover:text-[var(--wine)] transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--foreground)]/50">
                        ${product.price_per_rental}/rental
                      </p>
                    </>
                  );

                  // In selection mode, use a button. Otherwise, use a Link.
                  if (isSelectingForOutfit) {
                    return (
                      <button
                        key={product.id}
                        onClick={(e) => handleSelectForOutfit(product, e)}
                        className="group text-left"
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={product.id}
                      href={`/storefront/product/${product.id}`}
                      onClick={handleClose}
                      className="group"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--gold)]/10 bg-[var(--background-warm)]">
          <p className="text-center text-xs text-[var(--foreground)]/40 font-editorial">
            AI-powered styling suggestions from the Vindtia archive
          </p>
        </div>
      </div>
    </div>
  );
}
