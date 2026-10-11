import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import CartSidebar from './CartSidebar';
import { useCart } from '@/hooks/useCartContext';

// Same floating actions as Layout.tsx, split out as their own component so
// pages like Home.tsx — which render Header/Footer directly instead of
// going through <Layout> — can still get the WhatsApp + cart buttons.
const FloatingActions = () => {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.link/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[#F9DAA5] bg-[#7D2F38] text-[#F9DAA5] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:scale-105 hover:bg-[#F9DAA5] hover:text-[#3a1c20]"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {/* Floating Cart Button */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label="Open cart"
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[#3a1c20] bg-[#F9DAA5] text-[#3a1c20] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:scale-105"
      >
        <ShoppingBag className="h-6 w-6" />

        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7D2F38] px-1 text-xs font-bold text-[#F9DAA5] ring-2 ring-[#F9DAA5]">
            {cartCount}
          </span>
        )}
      </button>
    </>
  );
};

export default FloatingActions;