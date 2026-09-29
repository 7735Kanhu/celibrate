import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Celibrate",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p>Last updated: September 29, 2026</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, submit an enquiry, or contact us for support. This may include your name, email address, phone number, and event details.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your venue enquiries and connect you with suitable venues.</li>
            <li>Communicate with you regarding your enquiries, bookings, and support requests.</li>
            <li>Improve our platform, services, and user experience.</li>
            <li>Send you promotional offers and updates (you can opt out at any time).</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Venues and vendors relevant to your enquiries to facilitate your event planning.</li>
            <li>Service providers who assist us in operating our platform and providing our services.</li>
            <li>Law enforcement or other authorities if required by law or to protect our rights.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@celibrate.demo.
          </p>
        </div>
      </div>
    </div>
  );
}
