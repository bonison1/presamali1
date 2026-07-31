import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BannerCarousel from './BannerCarousel';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";
const CLAY = "#F1E4E0";
const MIST = "#EBD6D0";

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${CLAY} 0%, ${MIST} 100%)` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Text column */}
          <div className="text-center lg:text-left lg:col-span-1">
            <span
              className="text-xs tracking-[0.3em] uppercase mb-4 inline-block"
              style={{ color: MULBERRY }}
            >
              Woven by Women of Manipur
            </span>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6"
              style={{ fontFamily: HEADING_FONT, color: '#2B1418' }}
            >
              Handwoven with
              <span className="block" style={{ color: MULBERRY }}>Heritage &amp; Heart</span>
            </h1>
            <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: '#5c3238' }}>
              Discover Kouna reed bags and accessories crafted by skilled
              women artisans who pour generations of technique into every
              piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/shop"
                className="px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group text-white"
                style={{ backgroundColor: MULBERRY }}
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="border-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 text-center"
                style={{ borderColor: CORAL, color: MULBERRY }}
              >
                Our Story
              </Link>
            </div>
          </div>

          {/* Changeable banner — pulled from the banner_settings table via
             BannerCarousel, same admin-managed component/data source as the
             original site. Update banners from the admin Banner Management
             panel; nothing here needs to change to reflect edits there. */}
          <div className="lg:col-span-2 relative rounded-3xl shadow-xl overflow-hidden w-full h-[300px] md:h-[380px]">
            <BannerCarousel />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 -right-4 w-20 h-20 rounded-full opacity-40 blur-xl pointer-events-none" style={{ backgroundColor: REED }}></div>
      <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ backgroundColor: CORAL }}></div>
    </section>
  );
};

export default Hero;