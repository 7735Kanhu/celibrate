"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, Calendar, Users, IndianRupee, MessageSquare, MapPin } from "lucide-react";

interface EnquiryFormProps {
  venues: any[];
  eventCategories: any[];
  initialVenueId?: string;
  selectedPackage?: string;
}

const SERVICES = [
  "Venue", "Catering", "Decoration", "Photography", "DJ", "Rooms", "Makeup", "Transportation"
];

export default function EnquiryForm({ venues, eventCategories, initialVenueId, selectedPackage }: EnquiryFormProps) {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    venueId: initialVenueId || "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    preferredTime: "Evening",
    budget: "",
    services: ["Venue"],
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    message: selectedPackage ? `I am interested in the ${selectedPackage} package.` : "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const services = [...prev.services];
      if (services.includes(service)) {
        return { ...prev, services: services.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...services, service] };
      }
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.eventType || !formData.eventDate || !formData.guestCount) {
        setError("Please fill all required fields in this step.");
        return;
      }
    } else if (step === 2) {
      if (!formData.venueId) {
        setError("Please select a venue.");
        return;
      }
    } else if (step === 3) {
      if (!formData.customerName || !formData.customerPhone || !formData.customerEmail) {
        setError("Please fill your contact details.");
        return;
      }
    }
    setError("");
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          guestCount: parseInt(formData.guestCount, 10)
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push(`/enquiry/success?id=${data.enquiryNumber}`);
      } else {
        setError(data.error || "Failed to submit enquiry");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      
      {/* Progress Bar */}
      <div className="bg-gray-50 flex border-b border-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex-1 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            step === i ? "border-brand-500 text-brand-500 bg-white" : 
            step > i ? "border-brand-300 text-gray-500 bg-white" : "border-transparent text-gray-400"
          }`}>
            <span className="hidden sm:inline">
              {i === 1 ? "Event" : i === 2 ? "Requirements" : i === 3 ? "Contact" : "Review"}
            </span>
            <span className="sm:hidden">Step {i}</span>
          </div>
        ))}
      </div>

      <div className="p-6 md:p-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tell us about your event</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
              <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="input-field">
                <option value="">Select Event Type</option>
                {eventCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Guests *</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="number" name="guestCount" placeholder="e.g. 500" value={formData.guestCount} onChange={handleInputChange} className="input-field pl-11" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
              <div className="flex flex-wrap gap-3">
                {["Morning", "Evening", "Full Day"].map(time => (
                  <button 
                    key={time}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferredTime: time }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.preferredTime === time ? "bg-brand-50 border-brand-500 text-brand-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Requirements & Venue */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Requirements</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Venue *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="venueId" value={formData.venueId} onChange={handleInputChange} className="input-field pl-11">
                  <option value="">Select a Venue</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city?.name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Range</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="budget" value={formData.budget} onChange={handleInputChange} className="input-field pl-11">
                  <option value="">Not Specified</option>
                  <option value="Under ₹50,000">Under ₹50,000</option>
                  <option value="₹50,000 - ₹1 Lakh">₹50,000 - ₹1 Lakh</option>
                  <option value="₹1 Lakh - ₹3 Lakhs">₹1 Lakh - ₹3 Lakhs</option>
                  <option value="₹3 Lakhs - ₹5 Lakhs">₹3 Lakhs - ₹5 Lakhs</option>
                  <option value="Above ₹5 Lakhs">Above ₹5 Lakhs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Required Services</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICES.map(service => (
                  <label key={service} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${formData.services.includes(service) ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.services.includes(service) ? "bg-brand-500 border-brand-500" : "border-gray-300"}`}>
                      {formData.services.includes(service) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Details</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="input-field" placeholder="Enter your full name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} className="input-field" placeholder="+91 XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} className="input-field" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Message (Optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-4 w-5 h-5 text-gray-400" />
                <textarea name="message" value={formData.message} onChange={handleInputChange} className="input-field pl-11 min-h-[100px] py-3" placeholder="Tell us about any specific requirements..." />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Review Your Enquiry</h2>
              <p className="text-gray-600">Please confirm your details before submitting.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100 text-sm">
              <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                <div className="text-gray-500 font-medium">Event Details:</div>
                <div className="col-span-2 text-gray-900 font-semibold">{formData.eventType} on {formData.eventDate} ({formData.guestCount} Guests, {formData.preferredTime})</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                <div className="text-gray-500 font-medium">Selected Venue:</div>
                <div className="col-span-2 text-gray-900 font-semibold">{venues.find(v => v.id === formData.venueId)?.name || "Not Selected"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                <div className="text-gray-500 font-medium">Required Services:</div>
                <div className="col-span-2 text-gray-900 font-semibold">{formData.services.join(", ")}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-gray-500 font-medium">Contact Info:</div>
                <div className="col-span-2 text-gray-900 font-semibold">{formData.customerName} | {formData.customerPhone}</div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center px-4">
              By submitting this enquiry, you agree that our event coordinator will contact you on the provided phone number. No payment is required right now.
            </p>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        {step > 1 ? (
          <button onClick={prevStep} type="button" className="btn-secondary px-5 py-2.5">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </button>
        ) : <div></div>}

        {step < 4 ? (
          <button onClick={nextStep} type="button" className="btn-primary px-8 py-2.5">
            Next Step <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button onClick={handleSubmit} type="button" disabled={loading} className="btn-primary px-10 py-3 shadow-lg shadow-brand-500/30 text-lg">
            {loading ? "Submitting..." : "Submit Enquiry"}
          </button>
        )}
      </div>

    </div>
  );
}
