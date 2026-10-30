import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight, Lock, Mail, KeyRound, Sparkles, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Enquiry Submitted | Celibrate",
};

export default async function EnquirySuccessPage(props: {
  searchParams: Promise<{ id?: string; email?: string; phone?: string }>;
}) {
  const searchParams = await props.searchParams;
  const enquiryId = searchParams.id || "ENQ-PENDING";
  const customerEmail = searchParams.email ? decodeURIComponent(searchParams.email) : null;
  const customerPhone = searchParams.phone ? decodeURIComponent(searchParams.phone) : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 md:p-14 text-center shadow-card border border-gray-100">
          
          {/* Success Checkmark */}
          <div className="w-20 h-20 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Your Enquiry Has Been Submitted!
          </h1>
          
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Thank you for choosing Celibrate. The venue coordinator has received your request and will contact you shortly.
          </p>
          
          {/* Enquiry ID Badge */}
          <div className="inline-flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-200 mb-8">
            <FileText className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="text-left">
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Enquiry Reference ID</p>
              <p className="text-lg font-bold text-gray-900 tracking-wide font-mono">{enquiryId}</p>
            </div>
          </div>

          {/* Auto-Account & Login Credentials Box */}
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/80 rounded-2xl p-5 sm:p-6 border border-amber-200/80 text-left mb-8 shadow-sm">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Customer Account Auto-Created for Tracking</span>
            </div>
            
            <p className="text-xs sm:text-sm text-amber-800/90 mb-4 leading-relaxed">
              We have automatically configured your login credentials so you can track your enquiry status, inspect custom quotations, and manage bookings anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white/95 rounded-xl p-3 border border-amber-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-brand-500" /> Login Email (ID)
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono truncate block">
                  {customerEmail || "Your Submitted Email"}
                </span>
              </div>

              <div className="bg-white/95 rounded-xl p-3 border border-amber-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Password
                </span>
                <span className="text-sm font-bold text-amber-700 font-mono truncate block">
                  {customerPhone ? customerPhone : "Your Phone Number"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[12px] text-amber-900/90 bg-amber-100/60 rounded-lg p-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Mail Notification Sent:</strong> Complete enquiry specifications and login instructions have also been sent to your email. If you already had an account with this email, your password was refreshed to your phone number.
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={customerEmail ? `/login?email=${encodeURIComponent(customerEmail)}` : "/login"}
              className="w-full sm:w-auto btn-primary text-sm sm:text-base py-3 px-6 shadow-md"
            >
              <Lock className="w-4 h-4 mr-2" /> Log In to Your Account
            </Link>
            <Link href="/venues" className="w-full sm:w-auto btn-secondary text-sm sm:text-base py-3 px-6">
              Explore More Venues <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
