import { useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/hooks/useCartContext';
import CartSidebar from './CartSidebar';
import ProfileDropdown from './ProfileDropdown';

// -----------------------------------------------------
// BRAND TOKENS — Presamali (Kouna & Accessories)
// -----------------------------------------------------
const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";
const CLAY = "#F1E4E0";

const Logomark = ({
  className = 'h-8 w-8',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Shop', path: '/shop' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Promotional Banner */}
      <div
        className="text-center py-2 px-4 text-sm font-medium tracking-wide"
        style={{ backgroundColor: MULBERRY, color: REED }}
      >
        Free shipping on orders over ₹1,500 · Limited time offer
      </div>

      <header className="bg-white shadow-sm border-b sticky top-0 z-50" style={{ borderColor: CLAY }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <Logomark className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" style={{ color: MULBERRY }} />
              <span
                className="text-2xl tracking-[0.06em] uppercase"
                style={{ fontFamily: HEADING_FONT, color: MULBERRY }}
              >
                Presamali
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="transition-colors duration-200 font-medium"
                  style={{ color: isActive(link.path) ? MULBERRY : '#4a2c30' }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Search + Cart + auth */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-56 pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 text-sm"
                  style={{ borderColor: CLAY, boxShadow: 'none' }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${CORAL}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#a0777d' }} />
              </div>

              <ProfileDropdown />

              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative p-2 transition-colors duration-200 hover:opacity-80"
                style={{ color: '#4a2c30' }}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                    style={{ backgroundColor: MULBERRY, color: 'white' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="md:hidden p-2"
                style={{ color: MULBERRY }}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white" style={{ borderColor: CLAY }}>
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-2 transition-colors duration-200 font-medium"
                  style={{ color: isActive(link.path) ? MULBERRY : '#4a2c30' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;