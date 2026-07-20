import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import Cart from "@/components/Cart/Cart";

export const metadata: Metadata = {
  title: "Dawat E Khaas | Burgers, Pizza, BBQ & Desi Food in Dera Ismail Khan",
  description: "Order fresh Burgers, Pizza, BBQ, Chinese & Desi food online from Dawat E Khaas in Dera Ismail Khan. Fast delivery, Cash on Delivery available.",
  keywords: "Dawat E Khaas, restaurant Dera Ismail Khan, food delivery DIK, BBQ, burgers, pizza, desi food",
  openGraph: {
    title: "Dawat E Khaas — Best Food in Dera Ismail Khan",
    description: "Authentic Pakistani flavors delivered to your door. Order Burgers, BBQ, Pizza & more.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <Cart />
        </CartProvider>
      </body>
    </html>
  );
}
