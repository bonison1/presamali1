import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BannerCarousel from './BannerCarousel';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[520px] lg:min-h-[620px] flex items-center bg-[#2B1418]">
      {/* Full-bleed banner background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-65">
          <BannerCarousel />
        </div>
        {/* Gradient scrim for text legibility over the photo */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, rgba(20,8,10,0.75) 0%, rgba(20,8,10,0.45) 45%, rgba(20,8,10,0.15) 75%, rgba(20,8,10,0) 100%)`,
          }}
        />
      </div>

      {/* Text content, overlaid on top of the photo */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
        <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
          <span
            className="text-xs tracking-[0.3em] uppercase mb-4 inline-block"
            style={{ color: REED }}
          >
            Woven by Women of Manipur
          </span>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 text-white"
            style={{ fontFamily: HEADING_FONT }}
          >
            Handwoven with
            <span className="block" style={{ color: CORAL }}>Heritage &amp; Heart</span>
          </h1>
          <p className="text-base md:text-lg mb-8 leading-relaxed text-white/85">
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
              className="border-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 text-center text-white hover:bg-white/10"
              style={{ borderColor: CORAL }}
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 -right-4 w-20 h-20 rounded-full opacity-30 blur-xl pointer-events-none z-10" style={{ backgroundColor: REED }}></div>
      <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none z-10" style={{ backgroundColor: CORAL }}></div>
    </section>
  );
};

export default Hero;