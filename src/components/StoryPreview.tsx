import { Link } from 'react-router-dom';
import { Users, Award, Heart } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";
const CLAY = "#F1E4E0";
const MIST = "#EBD6D0";

const StoryPreview = () => {
  return (
    <section id="story" className="py-20" style={{ background: `linear-gradient(135deg, ${CLAY} 0%, #ffffff 100%)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl mb-6" style={{ fontFamily: HEADING_FONT, color: '#2B1418' }}>
              Crafted with Heritage,
              <span className="block" style={{ color: MULBERRY }}>Made with Heart</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#5c3238' }}>
              Presamali works with women weavers across Manipur to keep Kouna
              craft alive. Every piece in our collection carries the spirit
              of its maker and the wisdom of a technique passed down through
              generations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Users className="h-8 w-8" style={{ color: MULBERRY }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#2B1418' }}>Women-Led</h3>
                <p className="text-sm" style={{ color: '#5c3238' }}>Weavers across Manipur</p>
              </div>

              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Award className="h-8 w-8" style={{ color: MULBERRY }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#2B1418' }}>Generations</h3>
                <p className="text-sm" style={{ color: '#5c3238' }}>Of Kouna weaving technique</p>
              </div>

              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Heart className="h-8 w-8" style={{ color: MULBERRY }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#2B1418' }}>Handwoven</h3>
                <p className="text-sm" style={{ color: '#5c3238' }}>Every single piece</p>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-block text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: MULBERRY }}
            >
              Read Our Full Story
            </Link>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="/photo2.jpg"
                alt="Kouna weaving artisan at work"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>

            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
              <blockquote className="italic mb-4" style={{ color: '#5c3238' }}>
                "Every piece tells a story of patience, tradition, and the
                hands that made it."
              </blockquote>
              <cite className="text-sm font-semibold not-italic" style={{ color: MULBERRY }}>
                — Ibemhal, Kouna Weaver
              </cite>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-60 blur-xl" style={{ backgroundColor: REED }}></div>
            <div className="absolute top-1/2 -right-8 w-16 h-16 rounded-full opacity-40 blur-lg" style={{ backgroundColor: MIST }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryPreview;