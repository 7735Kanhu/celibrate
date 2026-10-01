"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight, User, Building2, Shield, Check } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("from") || searchParams.get("redirect");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFillDemo = (type: "customer" | "owner") => {
    if (type === "customer") {
      setFormData({ email: "customer@celibrate.demo", password: "Customer@123" });
    } else {
      setFormData({ email: "owner@celibrate.demo", password: "Owner@123" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const dest = redirectParam || data.data?.redirectTo || "/profile";
        router.push(dest);
        router.refresh();
      } else {
        setError(data.error?.message || data.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/50 to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-extrabold text-brand-500 tracking-tight">CELIBRATE</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-500">
              Create Customer Account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Helpers */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFillDemo("customer")}
                className="p-3 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 group-hover:text-brand-600">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  Demo Customer
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-mono">customer@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("owner")}
                className="p-3 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 group-hover:text-brand-600">
                  <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  Venue Owner
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-mono">owner@...</div>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2 text-center text-xs">
            <Link
              href="/owner/register"
              className="text-gray-600 hover:text-brand-600 font-medium py-1"
            >
              Are you a Venue Owner? <span className="font-semibold text-brand-600 underline">Register your venue</span>
            </Link>
            <Link
              href="/admin/login"
              className="text-slate-500 hover:text-slate-800 font-medium py-1 flex items-center justify-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Administrative Console Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">Loading secure login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
