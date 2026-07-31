import { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/hooks/useCartContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />

      <main className="flex-grow w-full">{children}</main>

      <Footer />

      {/* CART SIDEBAR */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.link/vuxv1f"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <Button
          className="fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 bg-[#7D2F38] text-white hover:bg-[#5e232a] shadow-lg flex items-center justify-center"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </Button>
      </a>

      {/* Floating Cart Button */}
      <Button
        onClick={() => setCartOpen(true)}
        aria-label="Open cart"
        className="fixed bottom-24 right-6 z-40 rounded-full h-14 w-14 bg-[#7D2F38] text-white hover:bg-[#5e232a] shadow-lg flex items-center justify-center"
      >
        <ShoppingCart className="h-6 w-6" />

        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#F9DAA5] text-[#7D2F38] text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default Layout;