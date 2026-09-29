import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Celibrate",
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p>Last updated: September 29, 2026</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to Celibrate. These Terms & Conditions govern your use of our website and services. By accessing or using Celibrate, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Our Services</h2>
          <p>
            Celibrate is an event venue discovery and enquiry platform. We do not directly own or operate the venues listed on our platform. We act as an intermediary to help you discover venues and connect with their representatives.
          </p>
          <p>
            We do not facilitate online bookings or payments through our platform. All bookings, negotiations, and payments are handled directly between you and the venue or through our offline coordination team.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Enquiries and Communication</h2>
          <p>
            By submitting an enquiry through Celibrate, you consent to being contacted by our event coordinators or venue representatives via phone, email, or WhatsApp regarding your event requirements.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Pricing and Availability</h2>
          <p>
            The prices and availability displayed on our platform are indicative and subject to change without notice. Final pricing and availability will be confirmed during your offline discussion with our coordinators or the venue management.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when registering.
          </p>
        </div>
      </div>
    </div>
  );
}
