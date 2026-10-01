import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, Calendar, Users, MapPin, IndianRupee, MessageSquare, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enquiry Details | Celibrate",
};

export default async function EnquiryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  let userId = user?.id;

  if (!userId) {
    const demoUser = await prisma.user.findUnique({
      where: { email: "customer@celibrate.demo" },
    });
    userId = demoUser?.id;
  }

  const enquiry = await prisma.enquiry.findFirst({
    where: { 
      id: params.id,
      userId: userId // Ensure user can only see their own enquiry
    },
    include: {
      venue: {
        include: { city: true }
      },
      services: true,
      quotations: {
        where: { status: { in: ["SENT", "ACCEPTED"] } },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!enquiry) notFound();

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "BOOKED" || s === "CONFIRMED" || s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "QUOTATION_SENT" || s === "QUOTATION") return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "SITE_VISIT") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "CONTACTED" || s === "INTERESTED" || s === "NEGOTIATION" || s === "DISCUSSION") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "CANCELLED" || s === "LOST") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <Link href="/my-enquiries" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-500 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Enquiries
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{enquiry.enquiryNumber}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getStatusColor(enquiry.status)}`}>
                {enquiry.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Submitted on {formatDate(enquiry.createdAt)}</p>
          </div>
          
          <div className="flex gap-3">
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] font-medium border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors text-sm">
              <MessageSquare className="w-4 h-4" /> Message Coordinator
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Type</p>
                  <p className="font-semibold text-gray-900">{enquiry.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Date</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400"/> {formatDate(enquiry.eventDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Guest Count</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400"/> {enquiry.guestCount} Guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Preferred Time</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400"/> {enquiry.preferredTime || "Evening"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-gray-400"/> {enquiry.budget}</p>
                </div>
              </div>

              {enquiry.message && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Your Message</p>
                  <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{enquiry.message}"</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Venue & Services</h2>
              
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-1">Selected Venue</p>
                <Link href={`/venues/${enquiry.venue.slug}`} className="group inline-flex flex-col">
                  <span className="font-bold text-lg text-brand-600 group-hover:text-brand-700 transition-colors">{enquiry.venue.name}</span>
                  <span className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5"/> {enquiry.venue.city.name}</span>
                </Link>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Requested Services</p>
                <div className="flex flex-wrap gap-2">
                  {enquiry.services.map(s => (
                    <span key={s.id} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500"/> {s.serviceName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Quotation from Venue if issued */}
            {enquiry.quotations && enquiry.quotations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Official Venue Quotation</h2>
                    <p className="text-xs text-gray-500">Proposal generated specifically for your requirements</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                    {enquiry.quotations[0].quotationNumber}
                  </span>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3">Service / Item</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enquiry.quotations[0].items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-medium text-gray-800">{item.name}</td>
                          <td className="py-2.5 px-3 text-center text-gray-500">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-gray-600">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.total.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-brand-50/60 p-4 rounded-xl border border-brand-100 text-sm">
                  <span className="font-bold text-gray-900">Grand Total Proposal:</span>
                  <span className="font-black text-brand-600 text-lg">₹{enquiry.quotations[0].total.toLocaleString("en-IN")}</span>
                </div>

                {enquiry.quotations[0].terms && (
                  <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">
                    <strong>Terms & Notes:</strong> {enquiry.quotations[0].terms}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Timeline) */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Status Timeline</h2>
              
              <div className="relative border-l border-gray-200 ml-3 space-y-6 mt-4">
                {enquiry.statusHistory.map((history, idx) => (
                  <div key={history.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white"></span>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{history.status}</p>
                    <p className="text-xs text-gray-500 mb-1.5">{formatDate(history.createdAt)} at {new Date(history.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
              <h3 className="font-bold text-brand-900 mb-2">Need Assistance?</h3>
              <p className="text-sm text-brand-800 mb-4">Your dedicated Celibrate event coordinator is here to help.</p>
              <div className="space-y-3">
                <a href="tel:+919876543210" className="flex items-center gap-2 text-sm font-semibold text-brand-700 bg-white p-2 rounded-lg border border-brand-200">
                  <Phone className="w-4 h-4 text-brand-500"/> +91 98765 43210
                </a>
                <a href="mailto:support@celibrate.demo" className="flex items-center gap-2 text-sm font-semibold text-brand-700 bg-white p-2 rounded-lg border border-brand-200">
                  <Mail className="w-4 h-4 text-brand-500"/> support@celibrate.demo
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
