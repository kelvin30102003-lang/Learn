"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteChrome({ position }: { position: "header" | "footer" }) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/mock-exam");
  if (isPortal) return null;
  return position === "header" ? <Navbar /> : <Footer />;
}
