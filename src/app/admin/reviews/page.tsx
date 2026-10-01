"use client";

import { useEffect, useState } from "react";
import { Star, ShieldAlert, Check, EyeOff, Trash2, Flag } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.success) {
        setReviews(json.data.reviews);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchReviews();
    } catch {
      alert("Failed to update review status");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      fetchReviews();
    } catch {
      alert("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Review & Moderation Center</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Moderate verified customer feedback, monitor ratings, and handle flagged submissions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No reviews found.</div>
        ) : (
          <div className="divide-y divide-gray-50 text-xs">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{r.userName}</span>
                    <span className="text-amber-500 font-bold">★ {r.rating}/5</span>
                    <span className="text-gray-400">• {r.venue?.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : r.status === "FLAGGED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-gray-700 text-xs italic">&ldquo;{r.comment}&rdquo;</p>

                  {r.reply && (
                    <div className="bg-brand-50/60 p-2.5 rounded-xl border border-brand-100 text-brand-900 text-[11px] mt-2">
                      <span className="font-bold block">Owner Response:</span>
                      {r.reply}
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400">
                    Submitted: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {r.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {r.status !== "HIDDEN" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "HIDDEN")}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      title="Hide"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  {r.status !== "FLAGGED" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "FLAGGED")}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                      title="Flag for review"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
