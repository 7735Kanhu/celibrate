"use client";

import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  CornerDownRight,
  Send,
  Building2,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/reviews");
      const json = await res.json();
      if (json.success && json.data?.reviews) {
        setReviews(json.data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await fetch("/api/owner/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          reply: replyText.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyingId(null);
        setReplyText("");
        fetchReviews();
      } else {
        alert(json.error?.message || "Failed to post reply");
      }
    } catch (err: any) {
      alert(err.message || "Failed to reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Customer Testimonials & Reviews</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View verified customer reviews and post official venue owner responses
          </p>
        </div>
      </div>

      {/* Rating Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center sm:border-r border-slate-200 sm:pr-8">
          <div className="text-4xl font-black text-slate-900">{avgRating}</div>
          <div className="flex items-center justify-center gap-1 text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs text-slate-400">{reviews.length} Verified Reviews</span>
        </div>

        <div className="flex-1 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Celibrate Verified Experience</p>
          <p className="mt-1">
            Customers who complete their wedding or celebration booking are invited to leave a review of your hospitality, catering, and decor arrangements.
          </p>
        </div>
      </div>

      {/* Reviews List (Requirement 38) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
          No reviews yet. Completed bookings will generate verified testimonials here.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                    {r.userName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{r.userName}</h3>
                    <p className="text-[11px] text-slate-400">
                      {r.venue?.name} · {r.eventType || "Celebration"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{r.comment}"
              </p>

              {/* Venue Owner Official Reply */}
              {r.reply ? (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" /> Official Venue Response
                    </span>
                    {r.replyDate && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.replyDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{r.reply}</p>
                </div>
              ) : replyingId === r.id ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    placeholder="Write a warm, professional reply thanking the guest..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(r.id)}
                      disabled={submittingReply}
                      className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      {submittingReply ? "Posting..." : "Post Response"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setReplyingId(r.id);
                      setReplyText("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
