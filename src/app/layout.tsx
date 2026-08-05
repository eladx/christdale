import type { Metadata } from "next";
import { Anton, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ProductQuickView from "@/components/ProductQuickView";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { QuickViewProvider } from "@/context/QuickViewContext";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Christdale — Calisthenics Gear & Coaching",
  description:
    "Calisthenics equipment and coaching for people who train with their own bodyweight — bars, rings, parallettes, and the guidance to use them right.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <QuickViewProvider>
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
              <AuthModal />
              <ProductQuickView />
            </QuickViewProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}