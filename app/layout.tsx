import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
// ADD THIS LINE:
import CartDrawer from "../components/CartDrawer";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: "MOVANA FASHIONS",
  description: "Premium Apparel Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} bg-white text-black`}>
        <Navbar />
        {/* ADD THIS LINE: This makes the cart appear when needed */}
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}