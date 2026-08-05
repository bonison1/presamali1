import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useCart } from '@/hooks/useCartContext';
import CartSidebar from './CartSidebar';
import ProfileDropdown from './ProfileDropdown';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
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
            {/* Logo — top left */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                {!logoError ? (
                  <img
                    src="/logo.jpg"
                    alt="Presamali logo"
                    onError={() => setLogoError(true)}
                    className="h-12 w-12 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#F9DAA5] flex items-center justify-center text-[#7D2F38] font-bold text-lg">
                    P
                  </div>
                )}
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

              {/* Auth: login/signup icon when logged out, profile dropdown when logged in */}
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  aria-label="Login or sign up"
                  className="flex items-center gap-1.5 p-2 text-[#F1E4E0] hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full transform hover:scale-105"
                >
                  <UserCircle className="h-6 w-6" />
                  <span className="hidden lg:inline text-sm font-medium">Login</span>
                </button>
              )}

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
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  className="text-[#F1E4E0] hover:text-white block px-3 py-2 text-base font-medium hover:bg-white/10 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;