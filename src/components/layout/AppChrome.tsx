"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import FloatingWhatsApp from "../ui/FloatingWhatsApp";

export default function AppChrome({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/owner");

  if (isDashboard) {
    return <main className="min-h-screen w-full flex flex-col">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <FloatingWhatsApp />
    </>
  );
}
