"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "./Toast";

// Curated high-resolution avatar media presets
const PRESET_AVATARS = [
  {
    id: "tech-lead",
    label: "Tech Lead",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "executive-man",
    label: "Executive",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "creative-director",
    label: "Creative Director",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "founder-modern",
    label: "Founder",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "marketing-lead",
    label: "Marketing Lead",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "studio-photographer",
    label: "Studio Pro",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
  },
];

const FILTERS = [
  { id: "none", label: "Normal", style: "none" },
  { id: "crisp", label: "Crisp", style: "contrast(1.15) brightness(1.05) saturate(1.1)" },
  { id: "bw", label: "Noir (B&W)", style: "grayscale(100%) contrast(1.2)" },
  { id: "warm", label: "Warm Sunset", style: "sepia(25%) saturate(1.3) hue-rotate(-10deg)" },
  { id: "cool", label: "Cool Studio", style: "saturate(1.1) hue-rotate(15deg) contrast(1.08)" },
];

export const getStoredAvatar = (userId) => {
  if (typeof window === "undefined") return null;
  try {
    const key = `socialpilot_avatar_${userId || "default"}`;
    const raw = localStorage.getItem(key) || localStorage.getItem("socialpilot_current_avatar");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveStoredAvatar = (userId, avatarData) => {
  if (typeof window === "undefined") return;
  try {
    const key = `socialpilot_avatar_${userId || "default"}`;
    if (avatarData) {
      const serialized = JSON.stringify(avatarData);
      localStorage.setItem(key, serialized);
      localStorage.setItem("socialpilot_current_avatar", serialized);
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem("socialpilot_current_avatar");
    }
    // Broadcast change event
    window.dispatchEvent(new CustomEvent("socialpilot_avatar_changed", { detail: avatarData }));
  } catch (e) {
    console.error("Failed to store avatar in localStorage", e);
  }
};

export default function ProfilePhotoAdjuster({ user, onAvatarSaved }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Avatar Configuration States
  const [photoSrc, setPhotoSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'presets' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Load existing avatar on mount
  useEffect(() => {
    const existing = getStoredAvatar(user?.id || user?.email);
    if (existing && existing.src) {
      setPhotoSrc(existing.src);
      setZoom(existing.zoom || 1);
      setPanX(existing.panX || 0);
      setPanY(existing.panY || 0);
      setRotation(existing.rotation || 0);
      setSelectedFilter(existing.filter || "none");
    }
  }, [user]);

  // Handle Drag / Pan with mouse
  const handleMouseDown = (e) => {
    if (!photoSrc) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      setPanX(Math.round(dragStart.initialPanX + deltaX));
      setPanY(Math.round(dragStart.initialPanY + deltaY));
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle Local File Upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Invalid File Format", "Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast("warning", "File Too Large", "Please select an image smaller than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoSrc(event.target.result);
      setZoom(1.1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      showToast("success", "Photo Loaded", "You can now drag to reposition and adjust your circular avatar.");
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Select
  const handleSelectPreset = (url) => {
    setPhotoSrc(url);
    setZoom(1.1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    showToast("info", "Preset Selected", "Adjust positioning to fit perfectly.");
  };

  // Handle URL Load
  const handleLoadUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput || !customUrlInput.startsWith("http")) {
      showToast("error", "Invalid URL", "Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    setPhotoSrc(customUrlInput);
    setZoom(1.1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setCustomUrlInput("");
    showToast("success", "Image Loaded", "Adjust positioning to fit perfectly.");
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setSelectedFilter("none");
    showToast("info", "Adjustments Reset", "Default framing restored.");
  };

  // Remove Photo & Switch back to Initials
  const handleRemovePhoto = () => {
    setPhotoSrc(null);
    saveStoredAvatar(user?.id || user?.email, null);
    if (onAvatarSaved) onAvatarSaved(null);
    showToast("info", "Photo Removed", "Reverted to standard monogram gradient avatar.");
  };

  // Save Final Profile Photo
  const handleApplyAvatar = () => {
    if (!photoSrc) {
      showToast("warning", "No Photo Selected", "Please select or upload a photo first.");
      return;
    }

    const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter) || FILTERS[0];
    const avatarConfig = {
      type: "image",
      src: photoSrc,
      zoom,
      panX,
      panY,
      rotation,
      filter: activeFilterObj.style,
      filterId: selectedFilter,
      updatedAt: Date.now(),
    };

    saveStoredAvatar(user?.id || user?.email, avatarConfig);
    if (onAvatarSaved) onAvatarSaved(avatarConfig);
    showToast("success", "Profile Photo Saved", "Your adjusted circular avatar is live across all workspaces!");
  };

  const activeFilterStyle = FILTERS.find((f) => f.id === selectedFilter)?.style || "none";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>📷</span> Profile Photo & Circular Media Adjuster
          </h3>
          <p className="text-xxs text-foreground-muted">
            Upload or pick from media, scale, pan, rotate, and frame your circular avatar.
          </p>
        </div>

        {photoSrc && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAdjustments}
              className="px-3 py-1.5 rounded-xl border border-surface-border text-xxs font-bold text-foreground-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
            >
              ↺ Reset Framing
            </button>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xxs font-bold transition-colors"
            >
              ✕ Remove Photo
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Adjuster Canvas on Left (or Top) & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Circular Canvas & Live Previews (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4 p-5 rounded-3xl bg-foreground/[0.02] border border-surface-border">
          
          <span className="text-xxs font-bold uppercase tracking-wider text-foreground-subtle">
            Interactive Circular Viewport
          </span>

          {/* Canvas Frame */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 shadow-2xl transition-shadow ${
              photoSrc ? "cursor-grab active:cursor-grabbing border-brand-500 ring-4 ring-brand-500/20" : "border-dashed border-surface-border bg-surface flex items-center justify-center"
            }`}
          >
            {photoSrc ? (
              <>
                {/* Photo Element */}
                <img
                  src={photoSrc}
                  alt="Profile Avatar Adjuster"
                  draggable={false}
                  className="w-full h-full object-cover select-none pointer-events-none transition-filter duration-200"
                  style={{
                    transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                    filter: activeFilterStyle,
                    transformOrigin: "center center",
                  }}
                />

                {/* Subtle Alignment Crosshair Guideline Overlay */}
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-px bg-white/15 absolute"></div>
                  <div className="h-full w-px bg-white/15 absolute"></div>
                  <div className="w-24 h-24 rounded-full border border-white/20 absolute"></div>
                </div>

                {/* Drag Prompt Hint */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                  <span className="bg-black/60 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                    ✋ Drag to Pan
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-3xl block mb-2 opacity-50">👤</span>
                <p className="text-xs font-bold text-foreground">No Media Photo</p>
                <p className="text-[10px] text-foreground-muted mt-1">Upload an image or choose a preset below</p>
              </div>
            )}
          </div>

          {/* Multi-Size Live Circular Previews */}
          {photoSrc && (
            <div className="w-full pt-4 border-t border-surface-border flex items-center justify-around text-center">
              <div>
                <div className="w-12 h-12 rounded-full overflow-hidden border border-surface-border mx-auto mb-1 shadow-sm bg-surface">
                  <img
                    src={photoSrc}
                    alt="Medium Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                      filter: activeFilterStyle,
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-foreground-subtle">Medium (48px)</span>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-border mx-auto mb-1 shadow-sm bg-surface">
                  <img
                    src={photoSrc}
                    alt="Small Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                      filter: activeFilterStyle,
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-foreground-subtle">Nav (32px)</span>
              </div>

              <div>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-surface-border mx-auto mb-1 shadow-sm bg-surface">
                  <img
                    src={photoSrc}
                    alt="Mini Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                      filter: activeFilterStyle,
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-foreground-subtle">Badge (24px)</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Source Tabs & Fine-Tuning Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Source Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-foreground/[0.03] border border-surface-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === "upload"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === "presets"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              ✨ Media Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === "url"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              🔗 Image URL
            </button>
          </div>

          {/* Tab 1: Upload Input */}
          {activeTab === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-500 bg-surface/50 hover:bg-brand-500/[0.02] text-center cursor-pointer transition-all space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="text-2xl block group-hover:scale-110 transition-transform">📤</span>
              <p className="text-xs font-bold text-foreground">Click to upload from device</p>
              <p className="text-[11px] text-foreground-muted">PNG, JPG, WEBP up to 8MB</p>
            </div>
          )}

          {/* Tab 2: Curated Media Presets */}
          {activeTab === "presets" && (
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-foreground-subtle block mb-2">
                Select from Curated Studio Avatars:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPreset(item.url)}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-2xl hover:bg-foreground/[0.04] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-surface-border group-hover:border-brand-500 group-hover:scale-105 transition-all shadow-sm">
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-foreground-subtle font-medium truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Direct URL */}
          {activeTab === "url" && (
            <form onSubmit={handleLoadUrl} className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl surface-field text-xs text-foreground border border-surface-border"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-sm hover:shadow-md"
              >
                Load
              </button>
            </form>
          )}

          {/* Adjustment Sliders (Zoom, Pan X, Pan Y, Rotation) */}
          {photoSrc && (
            <div className="space-y-4 p-4 rounded-2xl bg-surface border border-surface-border shadow-inner">
              
              {/* Zoom Scale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">🔍 Scale & Zoom</span>
                  <span className="text-brand-600 dark:text-brand-400 font-mono">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                    className="w-7 h-7 rounded-lg border border-surface-border flex items-center justify-center font-bold text-xs hover:bg-foreground/[0.05]"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-brand-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                    className="w-7 h-7 rounded-lg border border-surface-border flex items-center justify-center font-bold text-xs hover:bg-foreground/[0.05]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pan Horizontal & Vertical */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-foreground-muted mb-1">
                    <span>↔ Pan X</span>
                    <span className="font-mono">{panX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={panX}
                    onChange={(e) => setPanX(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-foreground-muted mb-1">
                    <span>↕ Pan Y</span>
                    <span className="font-mono">{panY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={panY}
                    onChange={(e) => setPanY(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Rotation & Filters */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-divider text-xs">
                
                {/* Rotation Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-foreground-muted font-bold text-[11px]">Rotate:</span>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-foreground/[0.04] text-[11px] font-bold"
                    title="Rotate 90° Counter-Clockwise"
                  >
                    ↺ -90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-foreground/[0.04] text-[11px] font-bold"
                    title="Rotate 90° Clockwise"
                  >
                    ↻ +90°
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground-muted font-bold text-[11px]">Filter:</span>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-surface-border bg-surface text-foreground text-xs font-semibold focus:outline-none"
                  >
                    {FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Save & Apply Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleApplyAvatar}
                  className="w-full py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✓ Apply & Save Circular Avatar</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
