"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type GenderIdentity = 'male' | 'female' | 'nonbinary' | null;
type PresentationStyle = 'masculine' | 'feminine';

type BodyProfile = {
  front_photo_url: string | null;
  side_photo_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  inseam_cm: number | null;
  shoulder_width_cm: number | null;
  clothing_size_top: string | null;
  clothing_size_bottom: string | null;
  shoe_size: string | null;
  skin_tone: string | null;
  ethnicity: string | null;
  hair_color: string | null;
  hair_length: string | null;
  body_type: string | null;
  style_preferences: string[] | null;
  body_profile_updated_at: string | null;
  gender_identity: GenderIdentity;
  presentation_style_preference: PresentationStyle[] | null;
};

const SKIN_TONES = [
  "Fair / Porcelain",
  "Light",
  "Light-Medium",
  "Medium",
  "Medium-Tan",
  "Olive",
  "Tan",
  "Caramel",
  "Brown",
  "Deep Brown",
  "Dark / Espresso",
];

const ETHNICITIES = [
  "East Asian",
  "Southeast Asian",
  "South Asian",
  "Middle Eastern",
  "Black / African",
  "African American",
  "Hispanic / Latina",
  "White / Caucasian",
  "Pacific Islander",
  "Native American",
  "Mixed / Multiracial",
  "Prefer not to say",
];

const HAIR_COLORS = [
  "Black",
  "Dark Brown",
  "Medium Brown",
  "Light Brown",
  "Auburn",
  "Red",
  "Strawberry Blonde",
  "Blonde",
  "Platinum Blonde",
  "Gray / Silver",
  "White",
  "Highlighted / Multi-tonal",
];

// Hair lengths by gender presentation
const HAIR_LENGTHS_FEMININE = [
  "Pixie / Very Short",
  "Short (ear length)",
  "Chin Length / Bob",
  "Shoulder Length",
  "Medium (past shoulders)",
  "Long (mid-back)",
  "Very Long (waist or longer)",
  "Shaved / Bald",
];

const HAIR_LENGTHS_MASCULINE = [
  "Buzz Cut / Very Short",
  "Short & Textured",
  "Classic Side Part",
  "Medium Length",
  "Long / Shoulder Length",
  "Man Bun / Tied Back",
  "Shaved / Bald",
  "Fade / Undercut",
];

// Body types by gender presentation
const BODY_TYPES_FEMININE = [
  "Hourglass",
  "Pear / Triangle",
  "Apple / Round",
  "Rectangle / Athletic",
  "Inverted Triangle",
  "Petite",
  "Tall & Lean",
  "Curvy",
  "Plus Size",
];

const BODY_TYPES_MASCULINE = [
  "Athletic / Muscular",
  "Slim / Lean",
  "Average",
  "Broad / Stocky",
  "Tall & Lean",
  "Heavyset",
  "Inverted Triangle (V-shape)",
  "Rectangle",
];

const GENDER_IDENTITIES = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "nonbinary", label: "Non-binary" },
];

const CLOTHING_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

const STYLE_PREFERENCES = [
  "Old Money / Quiet Luxury",
  "Minimalist",
  "Classic / Timeless",
  "Bohemian",
  "Avant-Garde",
  "Streetwear",
  "Y2K",
  "Vintage 90s",
  "Vintage 80s",
  "Vintage 70s",
  "Romantic / Feminine",
  "Edgy / Rock",
  "Preppy",
  "Sporty / Athleisure",
  "Maximalist / Bold",
  "Cottagecore",
  "Dark Academia",
  "Mob Wife",
  "Coastal Grandmother",
];

export default function ProfileSettingsPage() {
  const frontPhotoRef = useRef<HTMLInputElement>(null);
  const sidePhotoRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingSide, setUploadingSide] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<BodyProfile>({
    front_photo_url: null,
    side_photo_url: null,
    height_cm: null,
    weight_kg: null,
    bust_cm: null,
    waist_cm: null,
    hips_cm: null,
    inseam_cm: null,
    shoulder_width_cm: null,
    clothing_size_top: null,
    clothing_size_bottom: null,
    shoe_size: null,
    skin_tone: null,
    ethnicity: null,
    hair_color: null,
    hair_length: null,
    body_type: null,
    style_preferences: [],
    body_profile_updated_at: null,
    gender_identity: null,
    presentation_style_preference: ['masculine', 'feminine'],
  });

  // Separate state for height to avoid conversion bugs
  const [heightFeet, setHeightFeet] = useState<number | null>(null);
  const [heightInches, setHeightInches] = useState<number | null>(null);

  // Separate state for weight in lbs
  const [weightLbs, setWeightLbs] = useState<number | null>(null);

  // Separate state for measurements in inches
  const [bustInches, setBustInches] = useState<number | null>(null);
  const [waistInches, setWaistInches] = useState<number | null>(null);
  const [hipsInches, setHipsInches] = useState<number | null>(null);
  const [shoulderInches, setShoulderInches] = useState<number | null>(null);
  const [inseamInches, setInseamInches] = useState<number | null>(null);

  // Conversion helpers
  const cmToInches = (cm: number | null) => (cm ? Math.round(cm / 2.54) : null);
  const inchesToCm = (inches: number | null) => (inches ? Math.round(inches * 2.54) : null);
  const kgToLbs = (kg: number | null) => (kg ? Math.round(kg * 2.205) : null);
  const lbsToKg = (lbs: number | null) => (lbs ? Math.round(lbs / 2.205) : null);
  const cmToFeetInches = (cm: number | null) => {
    if (!cm) return { feet: null, inches: null };
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };
  const feetInchesToCm = (feet: number | null, inches: number | null) => {
    if (feet === null && inches === null) return null;
    return Math.round(((feet || 0) * 12 + (inches || 0)) * 2.54);
  };

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/body-profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            // Initialize imperial values from stored metric
            const { feet, inches } = cmToFeetInches(data.profile.height_cm);
            setHeightFeet(feet);
            setHeightInches(inches);
            setWeightLbs(kgToLbs(data.profile.weight_kg));
            setBustInches(cmToInches(data.profile.bust_cm));
            setWaistInches(cmToInches(data.profile.waist_cm));
            setHipsInches(cmToInches(data.profile.hips_cm));
            setShoulderInches(cmToInches(data.profile.shoulder_width_cm));
            setInseamInches(cmToInches(data.profile.inseam_cm));
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle photo upload
  const handlePhotoUpload = async (file: File, type: "front" | "side") => {
    const setUploading = type === "front" ? setUploadingFront : setUploadingSide;
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/user/body-profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setProfile((prev) => ({
        ...prev,
        [type === "front" ? "front_photo_url" : "side_photo_url"]: data.url,
      }));

      setMessage({ type: "success", text: `${type === "front" ? "Front" : "Side"} photo uploaded successfully` });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to upload photo" });
    } finally {
      setUploading(false);
    }
  };

  // Handle photo delete
  const handlePhotoDelete = async (type: "front" | "side") => {
    if (!confirm(`Are you sure you want to remove your ${type} photo?`)) return;

    try {
      const res = await fetch(`/api/user/body-profile/upload-photo?type=${type}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      setProfile((prev) => ({
        ...prev,
        [type === "front" ? "front_photo_url" : "side_photo_url"]: null,
      }));

      setMessage({ type: "success", text: "Photo removed" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete photo" });
    }
  };

  // Handle form submission
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Convert imperial values to metric for storage
      const res = await fetch("/api/user/body-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height_cm: feetInchesToCm(heightFeet, heightInches),
          weight_kg: lbsToKg(weightLbs),
          bust_cm: inchesToCm(bustInches),
          waist_cm: inchesToCm(waistInches),
          hips_cm: inchesToCm(hipsInches),
          inseam_cm: inchesToCm(inseamInches),
          shoulder_width_cm: inchesToCm(shoulderInches),
          clothing_size_top: profile.clothing_size_top,
          clothing_size_bottom: profile.clothing_size_bottom,
          shoe_size: profile.shoe_size,
          skin_tone: profile.skin_tone,
          ethnicity: profile.ethnicity,
          hair_color: profile.hair_color,
          hair_length: profile.hair_length,
          body_type: profile.body_type,
          style_preferences: profile.style_preferences,
          gender_identity: profile.gender_identity,
          presentation_style_preference: profile.presentation_style_preference,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      setMessage({ type: "success", text: "Profile saved successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  // Toggle style preference
  const toggleStylePreference = (style: string) => {
    setProfile((prev) => {
      const current = prev.style_preferences || [];
      if (current.includes(style)) {
        return { ...prev, style_preferences: current.filter((s) => s !== style) };
      } else {
        return { ...prev, style_preferences: [...current, style] };
      }
    });
  };

  // Toggle presentation style preference (masculine/feminine)
  const togglePresentationStyle = (style: PresentationStyle) => {
    setProfile((prev) => {
      const current = prev.presentation_style_preference || [];
      if (current.includes(style)) {
        // Don't allow removing if it's the only one
        if (current.length === 1) return prev;
        return { ...prev, presentation_style_preference: current.filter((s) => s !== style) };
      } else {
        return { ...prev, presentation_style_preference: [...current, style] };
      }
    });
  };

  // Determine which options to show based on gender identity
  const isMasculinePresentation = profile.gender_identity === 'male' ||
    (profile.gender_identity === 'nonbinary' && profile.presentation_style_preference?.includes('masculine') && !profile.presentation_style_preference?.includes('feminine'));
  const isFemininePresentation = profile.gender_identity === 'female' ||
    (profile.gender_identity === 'nonbinary' && profile.presentation_style_preference?.includes('feminine') && !profile.presentation_style_preference?.includes('masculine'));
  const isNonbinaryMixed = profile.gender_identity === 'nonbinary' &&
    profile.presentation_style_preference?.includes('masculine') &&
    profile.presentation_style_preference?.includes('feminine');

  // Get the appropriate options based on presentation
  const getHairLengths = () => {
    if (isMasculinePresentation) return HAIR_LENGTHS_MASCULINE;
    if (isFemininePresentation) return HAIR_LENGTHS_FEMININE;
    // For nonbinary with both, combine them
    return [...HAIR_LENGTHS_MASCULINE, ...HAIR_LENGTHS_FEMININE.filter(h => !HAIR_LENGTHS_MASCULINE.includes(h))];
  };

  const getBodyTypes = () => {
    if (isMasculinePresentation) return BODY_TYPES_MASCULINE;
    if (isFemininePresentation) return BODY_TYPES_FEMININE;
    // For nonbinary with both, combine them
    return [...BODY_TYPES_FEMININE, ...BODY_TYPES_MASCULINE.filter(b => !BODY_TYPES_FEMININE.includes(b))];
  };

  // Label for bust/chest based on presentation
  const getChestLabel = () => {
    if (isMasculinePresentation) return "Chest";
    return "Bust/Chest";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="animate-pulse text-[#3D2E26]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5DED5]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <Link href="/profile" className="text-sm text-[#8B7355] hover:text-[#3D2E26] transition-colors">
              ← Back to Account
            </Link>
            <h1 className="text-2xl font-display text-[#3D2E26] mt-2">Body Profile Settings</h1>
            <p className="text-sm text-[#8B7355] mt-1">
              Customize your body profile for personalized AI outfit visualizations
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Gender Identity & Style Preferences Section */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <h2 className="text-lg font-display text-[#3D2E26] mb-2">Identity & Style Preferences</h2>
          <p className="text-sm text-[#8B7355] mb-6">
            This helps the AI show you the right products and generate models that match your preferences
          </p>

          {/* Gender Identity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#3D2E26] mb-3">Gender Identity</label>
            <div className="flex gap-3">
              {GENDER_IDENTITIES.map((gender) => (
                <button
                  key={gender.id}
                  type="button"
                  onClick={() => setProfile((prev) => ({
                    ...prev,
                    gender_identity: gender.id as GenderIdentity,
                    // Reset hair length and body type when changing gender to avoid invalid values
                    hair_length: null,
                    body_type: null,
                  }))}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    profile.gender_identity === gender.id
                      ? "bg-[#3D2E26] text-white"
                      : "bg-[#F5F0E8] text-[#3D2E26] hover:bg-[#E5DED5]"
                  }`}
                >
                  {gender.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preference (Presentation) - Always shown for all genders */}
          <div>
            <label className="block text-sm font-medium text-[#3D2E26] mb-2">
              Style Preference
            </label>
            <p className="text-xs text-[#8B7355] mb-3">
              What styles do you want to see? This filters the products shown to you by the AI stylist.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => togglePresentationStyle('feminine')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all border-2 ${
                  profile.presentation_style_preference?.includes('feminine')
                    ? "bg-pink-50 border-pink-400 text-pink-800"
                    : "bg-[#F5F0E8] border-transparent text-[#3D2E26] hover:bg-[#E5DED5]"
                }`}
              >
                <span className="block">Feminine</span>
                <span className="text-xs opacity-70 font-normal">Dresses, skirts, feminine cuts</span>
              </button>
              <button
                type="button"
                onClick={() => togglePresentationStyle('masculine')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all border-2 ${
                  profile.presentation_style_preference?.includes('masculine')
                    ? "bg-blue-50 border-blue-400 text-blue-800"
                    : "bg-[#F5F0E8] border-transparent text-[#3D2E26] hover:bg-[#E5DED5]"
                }`}
              >
                <span className="block">Masculine</span>
                <span className="text-xs opacity-70 font-normal">Suits, button-downs, masculine cuts</span>
              </button>
            </div>
            <p className="text-xs text-[#8B7355] mt-2">
              Select one or both. Selecting both shows you all styles.
            </p>
          </div>
        </section>

        {/* Photo Upload Section */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <h2 className="text-lg font-display text-[#3D2E26] mb-2">Reference Photos</h2>
          <p className="text-sm text-[#8B7355] mb-4">
            Upload photos of yourself to help our AI generate outfit visualizations that resemble you.
            These photos are private and only used for generating personalized outfit images.
          </p>

          {/* Photo Requirements Notice */}
          <div className="bg-[#FDF8F3] border border-[#E5DED5] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-[#8B7355] mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3D2E26] mb-1">For best outfit visualization results:</p>
                <ul className="text-xs text-[#8B7355] space-y-1">
                  <li>• Upload a <strong>full-body photo</strong> (head to toe visible)</li>
                  <li>• Stand facing the camera in a neutral pose</li>
                  <li>• Wear fitted clothing so your body shape is visible</li>
                  <li>• Good lighting and plain background work best</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Front Photo */}
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-3">
                Front-Facing Photo
              </label>
              <div
                className={`relative aspect-[3/4] bg-[#F5F0E8] rounded-lg border-2 border-dashed border-[#D4C8B8] overflow-hidden transition-all ${
                  !profile.front_photo_url ? "hover:border-[#8B7355] cursor-pointer" : ""
                }`}
                onClick={() => !profile.front_photo_url && frontPhotoRef.current?.click()}
              >
                {profile.front_photo_url ? (
                  <>
                    <Image
                      src={profile.front_photo_url}
                      alt="Front photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoDelete("front");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : uploadingFront ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B7355] border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8B7355] p-4">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs mt-2 text-center opacity-80">Full-body photo required</span>
                    <span className="text-xs opacity-60">(head to toe visible)</span>
                  </div>
                )}
              </div>
              <input
                ref={frontPhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file, "front");
                }}
              />
            </div>

            {/* Side Photo */}
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-3">
                Side Profile Photo
              </label>
              <div
                className={`relative aspect-[3/4] bg-[#F5F0E8] rounded-lg border-2 border-dashed border-[#D4C8B8] overflow-hidden transition-all ${
                  !profile.side_photo_url ? "hover:border-[#8B7355] cursor-pointer" : ""
                }`}
                onClick={() => !profile.side_photo_url && sidePhotoRef.current?.click()}
              >
                {profile.side_photo_url ? (
                  <>
                    <Image
                      src={profile.side_photo_url}
                      alt="Side photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoDelete("side");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : uploadingSide ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B7355] border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8B7355] p-4">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs mt-2 text-center opacity-80">Side profile (optional)</span>
                    <span className="text-xs opacity-60">Full-body preferred</span>
                  </div>
                )}
              </div>
              <input
                ref={sidePhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file, "side");
                }}
              />
            </div>
          </div>
        </section>

        {/* Physical Characteristics */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-display text-[#3D2E26]">Physical Characteristics</h2>
            <p className="text-sm text-[#8B7355]">Help us generate a model that matches your body type</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">
                Height
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="5"
                      min="0"
                      max="8"
                      value={heightFeet ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHeightFeet(val === "" ? null : parseInt(val));
                      }}
                      className="w-full px-3 py-2 pr-8 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B7355]">ft</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="7"
                      min="0"
                      max="11"
                      value={heightInches ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHeightInches(val === "" ? null : parseInt(val));
                      }}
                      className="w-full px-3 py-2 pr-8 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B7355]">in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="140"
                  min="0"
                  value={weightLbs ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWeightLbs(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 pr-10 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B7355]">lbs</span>
              </div>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Body Type</label>
              <select
                value={profile.body_type || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, body_type: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {getBodyTypes().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Measurements */}
          <div className="mt-6 pt-6 border-t border-[#E5DED5]">
            <h3 className="text-sm font-medium text-[#3D2E26] mb-4">
              Detailed Measurements (inches) <span className="text-[#8B7355] font-normal">— optional</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-[#8B7355] mb-1">{getChestLabel()}</label>
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={bustInches ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBustInches(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B7355] mb-1">Waist</label>
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={waistInches ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWaistInches(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B7355] mb-1">Hips</label>
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={hipsInches ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHipsInches(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B7355] mb-1">Shoulders</label>
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={shoulderInches ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShoulderInches(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B7355] mb-1">Inseam</label>
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={inseamInches ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInseamInches(val === "" ? null : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Clothing Sizes */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <h2 className="text-lg font-display text-[#3D2E26] mb-2">Clothing Sizes</h2>
          <p className="text-sm text-[#8B7355] mb-6">Your typical clothing sizes</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Top Size</label>
              <select
                value={profile.clothing_size_top || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, clothing_size_top: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {CLOTHING_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Bottom Size</label>
              <select
                value={profile.clothing_size_bottom || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, clothing_size_bottom: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {CLOTHING_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Shoe Size (US)</label>
              <input
                type="text"
                placeholder="e.g., 8, 8.5"
                value={profile.shoe_size || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, shoe_size: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <h2 className="text-lg font-display text-[#3D2E26] mb-2">Appearance Details</h2>
          <p className="text-sm text-[#8B7355] mb-6">Help the AI accurately represent your features</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Ethnicity</label>
              <select
                value={profile.ethnicity || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, ethnicity: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {ETHNICITIES.map((eth) => (
                  <option key={eth} value={eth}>{eth}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Skin Tone</label>
              <select
                value={profile.skin_tone || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, skin_tone: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {SKIN_TONES.map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Hair Color</label>
              <select
                value={profile.hair_color || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, hair_color: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {HAIR_COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2E26] mb-2">Hair {isMasculinePresentation ? 'Style' : 'Length'}</label>
              <select
                value={profile.hair_length || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, hair_length: e.target.value || null }))}
                className="w-full px-3 py-2 border border-[#D4C8B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              >
                <option value="">Select...</option>
                {getHairLengths().map((length) => (
                  <option key={length} value={length}>{length}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Style Preferences */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <h2 className="text-lg font-display text-[#3D2E26] mb-2">Style Preferences</h2>
          <p className="text-sm text-[#8B7355] mb-6">Select the aesthetics you love (helps personalize recommendations)</p>

          <div className="flex flex-wrap gap-2">
            {STYLE_PREFERENCES.map((style) => (
              <button
                key={style}
                onClick={() => toggleStylePreference(style)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  profile.style_preferences?.includes(style)
                    ? "bg-[#3D2E26] text-white"
                    : "bg-[#F5F0E8] text-[#3D2E26] hover:bg-[#E5DED5]"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/profile"
            className="px-6 py-3 border border-[#D4C8B8] text-[#3D2E26] rounded-lg hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#3D2E26] text-white rounded-lg hover:bg-[#2A1F1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-center text-[#8B7355] mt-8">
          Your photos and measurements are stored securely and are only used to generate personalized outfit visualizations.
          We never share this information with third parties.
        </p>
      </main>
    </div>
  );
}
