import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const REED = "#F9DAA5";
const INK = "#3a1c20";

const Logomark = ({
  className = 'h-7 w-7',
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

const Footer = () => {
  return (
    <footer style={{ backgroundColor: INK }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logomark className="h-7 w-7" style={{ color: REED }} />
              <span
                className="text-2xl uppercase tracking-[0.06em]"
                style={{ fontFamily: HEADING_FONT, color: REED }}
              >
                Presamali
              </span>
            </div>
            <p className="text-[#EBD6D0]/80 mb-6 leading-relaxed">
              Handwoven bags and accessories crafted from Kouna reed by women
              artisans of Manipur, each piece carrying the spirit of its maker.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/presamali/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Presamali on Instagram"
                className="text-[#EBD6D0]/70 transition-colors duration-200 hover:text-[#F9DAA5]"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4" style={{ fontFamily: HEADING_FONT, color: REED }}>Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Shop All</Link></li>
              <li><Link to="/about" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Our Story</Link></li>
              <li><Link to="/reviews" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Reviews</Link></li>
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Gift Cards</a></li>
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Wholesale</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg mb-4" style={{ fontFamily: HEADING_FONT, color: REED }}>Customer Care</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Shipping Info</a></li>
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Returns</a></li>
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Care Instructions</a></li>
              <li><a href="#" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">FAQ</a></li>
              <li><Link to="/admin/login" className="text-[#EBD6D0]/80 transition-colors duration-200 hover:text-[#F9DAA5]">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg mb-4" style={{ fontFamily: HEADING_FONT, color: REED }}>Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: REED }} />
                <div className="text-[#EBD6D0]/80">
                  <p>Imphal, Manipur</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0" style={{ color: REED }} />
                <span className="text-[#EBD6D0]/80">(91) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" style={{ color: REED }} />
                <span className="text-[#EBD6D0]/80">hello@presamali.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8" style={{ borderColor: `${MULBERRY}80` }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#EBD6D0]/60 text-sm">
              © 2026 Presamali. Woven by women of Manipur.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-[#EBD6D0]/60 hover:text-[#F9DAA5] transition-colors duration-200 text-sm">Privacy Policy</a>
              <a href="#" className="text-[#EBD6D0]/60 hover:text-[#F9DAA5] transition-colors duration-200 text-sm">Terms of Service</a>
              <a href="#" className="text-[#EBD6D0]/60 hover:text-[#F9DAA5] transition-colors duration-200 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;