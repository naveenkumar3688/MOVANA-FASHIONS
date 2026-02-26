import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { MessageCircle } from 'lucide-react'; // Import WhatsApp icon lookalike

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: "MOVANA FASHIONS | Premium Nighties & Innerwear",
  description: "Discover comfort and luxury with MOVANA's premium collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} bg-[#fafafa]`}>
        <CartProvider>
          <Header />
          <CartDrawer />
          {children}
          
          {/* 💬 WHATSAPP FLOATING BUTTON */}
          <a 
            href="https://wa.me/918072081691" // 👈 REPLACE WITH YOUR REAL NUMBER (e.g., 919876543210)
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-8 h-8" />
          </a>

        </CartProvider>
      </body>
    </html>
  );
}