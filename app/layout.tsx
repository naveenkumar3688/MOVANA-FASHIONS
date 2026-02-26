import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import CartDrawer from "../components/CartDrawer";
import { CartProvider } from '../context/CartContext';

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
        <CartProvider>
          <Header />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}