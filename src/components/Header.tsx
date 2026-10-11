import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, UserCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCartContext';
import { useAuth } from '@/hooks/useAuthContext';
import CartSidebar from './CartSidebar';
import ProfileDropdown from './ProfileDropdown';

// -----------------------------------------------------
// BRAND TOKENS — Presamali "Arch & Gilt" (footer palette)
// -----------------------------------------------------
const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const DEEP = '#2b1115';
const MULBERRY = '#7D2F38';
const REED = '#F9DAA5';
const BLUSH = '#EBD6D0';
const LINE = 'rgba(249,218,165,0.22)';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Shop', path: '/shop' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Contact', path: '/contact' },
];

const Logomark = ({ className = 'h-7 w-7', style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Close the drawer on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock page scroll + close on Escape while the drawer is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setQuery('');
    setIsMenuOpen(false);
  };

  const SearchForm = ({ className = '' }: { className?: string }) => (
    <form onSubmit={submitSearch} role="search" className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: REED }} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search handwoven pieces…"
        aria-label="Search products"
        className="w-full rounded-full border bg-transparent py-2.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[#EBD6D0]/50 focus:border-[#F9DAA5]"
        style={{ borderColor: LINE, color: BLUSH }}
      />
    </form>
  );

  return (
    <>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Promotional banner */}
      <div
        className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ backgroundColor: MULBERRY, color: REED, fontFamily: BODY_FONT }}
      >
        Free shipping on orders over ₹1,500 &nbsp;·&nbsp; Limited time offer
      </div>

      <header className="sticky top-0 z-50" style={{ backgroundColor: INK, fontFamily: BODY_FONT }}>
        {/* Tier 1: menu / logo / search / actions */}
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 p-2 md:hidden"
            style={{ color: REED }}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="group flex flex-shrink-0 items-center gap-2.5">
            {!logoError ? (
              <img
                src="/logo.jpg"
                alt="Presamali logo"
                onError={() => setLogoError(true)}
                className="h-11 w-11 rounded-full object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: `0 0 0 1.5px ${REED}` }}
              />
            ) : (
              <Logomark className="h-10 w-10" style={{ color: REED }} />
            )}
            <span
              className="hidden text-2xl uppercase tracking-[0.1em] sm:block"
              style={{ fontFamily: HEADING_FONT, color: REED }}
            >
              Presamali
            </span>
          </Link>

          {/* Wide search (desktop) */}
          <SearchForm className="mx-auto hidden max-w-xl flex-1 md:block" />

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <button
                onClick={() => navigate('/auth')}
                aria-label="Login or sign up"
                className="flex items-center gap-2 rounded-full p-2 transition-opacity hover:opacity-70"
                style={{ color: BLUSH }}
              >
                <UserCircle className="h-6 w-6" />
                <span className="hidden text-xs font-bold uppercase tracking-[0.15em] lg:inline">Login</span>
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border transition hover:bg-[#F9DAA5] hover:text-[#3a1c20]"
              style={{ borderColor: REED, color: REED }}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-extrabold"
                  style={{ backgroundColor: REED, color: INK, boxShadow: `0 0 0 2px ${INK}` }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tier 2: centered nav bar (desktop) */}
        <nav className="hidden border-y md:block" style={{ borderColor: LINE, backgroundColor: DEEP }}>
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-12 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="group relative py-2 text-xs font-bold uppercase tracking-[0.22em] transition-colors hover:text-[#F9DAA5]"
                style={{ color: isActive(link.path) ? REED : BLUSH }}
              >
                {link.name}
                <span
                  className={`absolute inset-x-0 -bottom-px h-px origin-center transition-transform duration-300 ${
                    isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                  style={{ backgroundColor: REED }}
                />
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile slide-in drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside
              className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col border-r"
              style={{ backgroundColor: DEEP, borderColor: LINE }}
            >
              <div className="flex h-20 items-center justify-between border-b px-5" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-2.5">
                  <Logomark className="h-8 w-8" style={{ color: REED }} />
                  <span className="text-xl uppercase tracking-[0.1em]" style={{ fontFamily: HEADING_FONT, color: REED }}>
                    Presamali
                  </span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-2" style={{ color: REED }}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="px-5 pt-5">
                <SearchForm />
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center justify-between border-b py-4 text-3xl"
                    style={{
                      borderColor: LINE,
                      fontFamily: HEADING_FONT,
                      color: isActive(link.path) ? REED : BLUSH,
                      fontStyle: isActive(link.path) ? 'italic' : 'normal',
                    }}
                  >
                    {link.name}
                    {isActive(link.path) && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: REED }} />}
                  </Link>
                ))}
              </div>

              <div className="border-t p-5" style={{ borderColor: LINE }}>
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    className="block border px-6 py-3.5 text-center text-xs font-bold uppercase tracking-[0.22em]"
                    style={{ borderColor: REED, color: REED }}
                  >
                    Login / Sign Up
                  </Link>
                )}
                <p className="mt-4 text-center text-xs" style={{ color: BLUSH, opacity: 0.6 }}>
                  Woven by women of Manipur
                </p>
              </div>
            </aside>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;