"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  Building2,
  Tag,
  Upload,
} from "lucide-react";

export default function OwnerGalleryPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "Exterior",
    "Main Hall",
    "Stage",
    "Dining",
    "Rooms",
    "Parking",
    "Garden",
    "Decoration",
  ]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Add Image Modal
  const [showModal, setShowModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Main Hall");
  const [newCaption, setNewCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/venue");
      const json = await res.json();
      if (json.success && json.data?.venues) {
        setVenues(json.data.venues);
        if (json.data.venues.length > 0) {
          const firstId = json.data.venues[0].id;
          setSelectedVenueId(firstId);
          fetchGallery(firstId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async (venueId: string) => {
    try {
      const res = await fetch(`/api/owner/gallery?venueId=${venueId}`);
      const json = await res.json();
      if (json.success) {
        setImages(json.data.images || []);
        if (json.data.categories) setCategories(json.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSetPrimary = async (imgId: string) => {
    try {
      const res = await fetch(`/api/owner/gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: imgId,
          venueId: selectedVenueId,
          setPrimary: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchGallery(selectedVenueId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!confirm("Are you sure you want to delete this photo from your gallery?")) return;
    try {
      const res = await fetch(`/api/owner/gallery?id=${imgId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchGallery(selectedVenueId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !selectedVenueId) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/owner/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: selectedVenueId,
          url: newUrl.trim(),
          category: newCategory,
          caption: newCaption || `${newCategory} view`,
          isPrimary,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setNewUrl("");
        setNewCaption("");
        setIsPrimary(false);
        fetchGallery(selectedVenueId);
      } else {
        alert(json.error?.message || "Failed to add image");
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredImages = images.filter((img) => {
    if (activeCategory === "ALL") return true;
    return img.category === activeCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Venue Photo Gallery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize categorized high-resolution photos of your halls, dining space, and stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {venues.length > 1 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedVenueId}
                onChange={(e) => {
                  setSelectedVenueId(e.target.value);
                  fetchGallery(e.target.value);
                }}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-rose-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Category Tabs (Requirement 16) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeCategory === "ALL"
              ? "bg-rose-500 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Photos ({images.length})
        </button>
        {categories.map((cat) => {
          const count = images.filter((img) => img.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading gallery photos...</div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
          No photos found in this category. Click "Upload Photo" to add images.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption || img.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {img.isPrimary && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Primary Cover
                  </span>
                )}

                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white rounded-md text-[10px] font-medium">
                  {img.category}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate pr-2" title={img.caption}>
                  {img.caption || img.category}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {!img.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Set as Cover Image"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD / ADD IMAGE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Add Photo to Gallery</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Ready for S3/Cloudinary direct links or Unsplash URLs</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Caption / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Banquet Hall with Chandeliers"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="primaryCheck" className="text-slate-700 font-medium">
                  Set as venue primary cover photo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-200"
                >
                  {submitting ? "Adding..." : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
