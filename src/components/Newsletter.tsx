import { useState } from 'react';
import { Mail } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";
const INK = "#3a1c20";

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-20" style={{ backgroundColor: INK }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{ backgroundColor: MULBERRY }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: REED }}></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: CORAL }}></div>

          <div className="relative z-10">
            <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: REED }}>
              <Mail className="h-8 w-8" style={{ color: MULBERRY }} />
            </div>

            <h2 className="text-3xl md:text-4xl mb-4 text-white" style={{ fontFamily: HEADING_FONT }}>
              Stay Connected with Our Craft
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#F1E4E0' }}>
              Be the first to discover new Presamali collections, weaver
              stories, and special offers. Join our community of craft
              lovers.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-full border-0 focus:outline-none focus:ring-2"
                style={{ color: '#2B1418' }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${REED}`)}
                required
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
                style={{ backgroundColor: REED, color: MULBERRY }}
              >
                Subscribe
              </button>
            </form>

            <p className="text-sm mt-4" style={{ color: '#E79F8A' }}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;