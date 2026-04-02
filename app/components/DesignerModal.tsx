"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DesignerModalProps {
  brandName: string;
  founder: string;
  headquarters: string;
  history: string[];
  colors: {
    primary: string;
    text: string;
    background?: string;
  };
  isVersace?: boolean;
  isArmani?: boolean;
  isValentino?: boolean;
  isPrada?: boolean;
}

export default function DesignerModal({
  brandName,
  founder,
  headquarters,
  history,
  colors,
  isVersace = false,
  isArmani = false,
  isValentino = false,
  isPrada = false,
}: DesignerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Get colors based on brand
  const bgColor = isVersace ? "#0A0A0A" : isArmani ? "#2A2A2A" : isValentino ? "#FFFAF5" : isPrada ? "#FAFAFA" : (colors.background || "#FFFFFF");
  const backdropColor = isVersace ? "rgba(0,0,0,0.92)" : isArmani ? "rgba(30,30,30,0.95)" : isValentino ? "rgba(45,36,36,0.9)" : isPrada ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0.85)";
  const accentColor = isVersace ? "#C6A75E" : isArmani ? "#9E958A" : isValentino ? "#BE0A26" : isPrada ? "#1a1a1a" : colors.primary;
  const textColor = isVersace ? "#E8E0D0" : isArmani ? "#F5F5F0" : isValentino ? "#4A3F3F" : isPrada ? "#3D3D3D" : colors.text;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backdropColor,
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "85vh",
          overflowY: "auto",
          backgroundColor: bgColor,
          borderRadius: "4px",
          boxShadow: "0 25px 80px -20px rgba(0,0,0,0.5)",
          border: `1px solid ${accentColor}22`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 10,
            padding: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: accentColor,
            opacity: 0.7,
          }}
          aria-label="Close modal"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div style={{ padding: "48px 40px", textAlign: "center" }}>
          {/* Header */}
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: accentColor,
              opacity: 0.7,
              marginBottom: "16px",
            }}
          >
            {isArmani ? "The Language of Armani" : isValentino ? "The Language of Valentino" : isPrada ? "The Language of Prada" : "About the Designer"}
          </p>

          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: isArmani || isPrada ? 300 : 400,
              letterSpacing: isVersace ? "0.2em" : "0.1em",
              textTransform: isVersace || isArmani || isPrada ? "uppercase" : "none",
              fontStyle: isValentino ? "italic" : "normal",
              color: isVersace ? accentColor : textColor,
              marginBottom: "24px",
              fontFamily: isVersace ? "var(--font-cinzel), Cinzel, serif" : isValentino ? "var(--font-cormorant), Cormorant Garamond, serif" : "inherit",
            }}
          >
            {isArmani ? "The House of Armani" : isValentino ? "The House of Valentino" : isPrada ? "The House of Prada" : `The House of ${brandName}`}
          </h2>

          {/* Decorative line */}
          <div
            style={{
              width: "60px",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)`,
              margin: "0 auto 32px",
            }}
          />

          {/* History */}
          <div style={{ marginBottom: "32px" }}>
            {history.map((paragraph, index) => (
              <p
                key={index}
                style={{
                  fontSize: "clamp(14px, 2vw, 17px)",
                  lineHeight: 1.8,
                  color: textColor,
                  opacity: 0.85,
                  marginBottom: "20px",
                  fontStyle: isValentino ? "italic" : "normal",
                  fontWeight: isArmani || isPrada ? 300 : 400,
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Founder Info */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: `1px solid ${accentColor}22`,
            }}
          >
            <p
              style={{
                fontSize: "13px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: accentColor,
                marginBottom: "8px",
              }}
            >
              Founded by {founder}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: textColor,
                opacity: 0.6,
              }}
            >
              Headquarters: {headquarters}
            </p>
          </div>

          {/* Brand Signature */}
          <div style={{ marginTop: "32px", opacity: 0.3 }}>
            {isVersace && (
              <svg width="50" height="50" viewBox="0 0 100 100" style={{ margin: "0 auto" }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={accentColor} strokeWidth="1" />
                <text x="50" y="58" textAnchor="middle" fontSize="24" fill={accentColor}>V</text>
              </svg>
            )}
            {isArmani && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <div style={{ width: "32px", height: "1px", background: accentColor }} />
                <span style={{ fontSize: "12px", letterSpacing: "0.3em", color: accentColor }}>GA</span>
                <div style={{ width: "32px", height: "1px", background: accentColor }} />
              </div>
            )}
            {isValentino && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px", fontStyle: "italic", color: accentColor }}>V</span>
                <span style={{ fontSize: "10px", letterSpacing: "0.4em", color: textColor }}>ROMA</span>
              </div>
            )}
            {isPrada && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <div style={{ width: "8px", height: "8px", border: `1px solid ${accentColor}`, transform: "rotate(45deg)" }} />
                <span style={{ fontSize: "11px", letterSpacing: "0.4em", color: accentColor }}>MILANO</span>
                <div style={{ width: "8px", height: "8px", border: `1px solid ${accentColor}`, transform: "rotate(45deg)" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`font-button inline-block px-10 py-4 text-xs lg:text-sm tracking-[0.25em] uppercase border transition-all duration-500 ${
          isVersace
            ? "border-white/50 text-white hover:bg-white/10 hover:border-white"
            : isArmani
            ? "border-[#F5F5F0]/30 text-[#F5F5F0] hover:border-[#F5F5F0]/50 hover:bg-[#F5F5F0]/5"
            : isValentino
            ? "border-white/50 text-white hover:bg-white/10 hover:border-white"
            : isPrada
            ? "border-[#E8E0D0]/50 text-[#E8E0D0] hover:bg-[#E8E0D0]/10 hover:border-[#E8E0D0]"
            : "border-current"
        }`}
        style={isValentino ? { textShadow: '0 1px 6px rgba(0,0,0,0.3)' } : isPrada ? { textShadow: '0 1px 6px rgba(0,0,0,0.4)' } : undefined}
      >
        About the Designer
      </button>

      {/* Modal - rendered via portal to escape parent styling */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
