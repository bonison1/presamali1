import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useCart } from '@/hooks/useCartContext';
import CartSidebar from './CartSidebar';
import ProfileDropdown from './ProfileDropdown';

// -----------------------------------------------------
// BRAND TOKENS — Presamali (Kouna & Accessories)
// Mulberry Red #7D2F38 · Kouna Coral #E79F8A
// Golden Reed #F9DAA5 · River Mist #EBD6D0
// Soft Clay #F1E4E0 · Cotton White #EFEFEF
// Heading face: Americana BT (licensed — see note at
// bottom of file). Body face: Montserrat.
// -----------------------------------------------------
const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";

// Minimal inline rendering of the Presamali logomark (the
// open oval "P") so the navbar renders correctly even before
// the real logo asset is dropped into /public. Swap the <svg>
// below for an <img src="/lovable-uploads/presamali-logomark.png" />
// once the exported brand asset is available.
const Logomark = ({ className = 'h-9 w-9' }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path
      d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      opacity="0.55"
    />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleCartClick = () => setCartOpen(true);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shop', path: '/shop' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <nav className="bg-[#7D2F38] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <Logomark className="h-9 w-9 text-[#F9DAA5] transition-transform duration-300 group-hover:scale-105" />
                <div className="hidden sm:flex flex-col leading-none">
                  <span
                    className="text-xl tracking-[0.12em] text-white uppercase"
                    style={{ fontFamily: HEADING_FONT }}
                  >
                    Presamali
                  </span>
                  <span className="text-[10px] tracking-[0.25em] text-[#E79F8A] uppercase mt-1">
                    Kouna &amp; Accessories
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-[#F1E4E0] hover:text-white px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 hover:bg-white/10 rounded-full"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Cart Icon */}
              <button
                onClick={handleCartClick}
                aria-label="Open cart"
                className="relative p-2 text-[#F1E4E0] hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full transform hover:scale-105"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F9DAA5] text-[#7D2F38] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <ProfileDropdown />

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                  className="text-[#F1E4E0] hover:text-white p-2 hover:bg-white/10 transition-colors rounded-full"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#7D2F38]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-[#F1E4E0] hover:text-white block px-3 py-2 text-base font-medium hover:bg-white/10 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

// -----------------------------------------------------
// NOTE ON FONTS
// "Americana BT" is a commercial typeface — it is not on
// Google Fonts and can't be pulled from a CDN without a
// license. Two options:
//   1. If you own a license, self-host the .woff2 files and
//      register an @font-face named "Americana BT" in your
//      global CSS — the fontFamily strings in this file will
//      then pick it up automatically.
//   2. Otherwise keep the 'Fraunces' fallback (add
//      <link> for Google Fonts "Fraunces" in index.html) —
//      it's a warm, slab-adjacent serif that reads close to
//      Americana BT's character.
// Montserrat should be set as the base body font in your
// global CSS / tailwind config so it applies site-wide.
// -----------------------------------------------------