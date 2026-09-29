import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Enquiry Submitted | Celibrate",
};

export default async function EnquirySuccessPage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const enquiryId = searchParams.id || "ENQ-PENDING";

  return (
    <div className="bg-gray-50 min-h-screen py-20 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-16 text-center shadow-card border border-gray-100">
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Enquiry Has Been Submitted!</h1>
          
          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
            Thank you for choosing Celibrate. Our event coordinator will contact you shortly to discuss availability, pricing and your requirements.
          </p>
          
          <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl border border-gray-200 mb-10">
            <FileText className="w-6 h-6 text-gray-500" />
            <div className="text-left">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Enquiry Reference ID</p>
              <p className="text-xl font-bold text-gray-900">{enquiryId}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/my-enquiries" className="w-full sm:w-auto btn-secondary text-base">
              View My Enquiries
            </Link>
            <Link href="/venues" className="w-full sm:w-auto btn-primary text-base">
              Explore More Venues <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
