import { useState, useEffect, type CSSProperties } from 'react';
import type { FormEvent } from 'react';
import { Instagram, MessageCircle, Facebook, ArrowUpRight } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const MULBERRY = '#7D2F38';
const BLUSH = '#EBD6D0';
const LINE = 'rgba(125,47,56,0.18)';
// Right-hand newsletter panel: very light blush so the two halves still read as separate.
// Set to '#ffffff' if you want it pure white.
const PANEL = '#FAF1ED';

// NOTE: update handles/links below to your real accounts.
const socialPanels = [
  { name: 'Instagram', handle: '@presamali', icon: Instagram, href: 'https://www.instagram.com/presamali/' },
  { name: 'WhatsApp', handle: 'Chat with us', icon: MessageCircle, href: 'https://wa.link/' },
  { name: 'Facebook', handle: 'Presamali', icon: Facebook, href: 'https://www.facebook.com/' },
];

const fallbackInstagram = [
  '/insta/1.jpg',
  '/insta/2.jpg',
  '/insta/3.jpg',
  '/insta/4.jpg',
  '/insta/5.jpg',
  '/insta/6.jpg',
];

const Logomark = ({ className = 'h-7 w-7', style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const SocialNewsletter = () => {
  const [instagramImages, setInstagramImages] = useState<{ media_url: string; permalink: string }[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const res = await fetch('https://instafeed.mouadalam.com/api?username=presamali');
        const json = await res.json();

        if (json?.data?.length > 0) {
          setInstagramImages(json.data.slice(0, 6));
        } else {
          setInstagramImages(fallbackInstagram.map((url) => ({ media_url: url, permalink: '#' })));
        }
      } catch (err) {
        console.error('Instagram Fetch Error:', err);
        setInstagramImages(fallbackInstagram.map((url) => ({ media_url: url, permalink: '#' })));
      }
    };
    fetchInstagramPosts();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    // Full-bleed: breaks out of any max-width parent so no side gaps remain
    <section
      className="relative left-1/2 grid w-screen -translate-x-1/2 lg:grid-cols-2"
      style={{ fontFamily: BODY_FONT }}
    >
      {/* ---------- Left: Community ---------- */}
      <div className="bg-white px-5 py-16 md:px-10 md:py-24 lg:px-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Logomark className="mx-auto mb-4 h-8 w-8" style={{ color: MULBERRY }} />
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: INK, opacity: 0.6 }}>
              Community
            </p>
            <h2 className="text-4xl leading-tight md:text-5xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
              Follow Our Journey
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base md:text-lg" style={{ color: INK, opacity: 0.8 }}>
              Behind-the-scenes weaving, new arrivals, and stories from our artisans — find us wherever you scroll.
            </p>
          </div>

          {/* Social platform panels */}
          <div className="mt-10 grid grid-cols-1 border sm:grid-cols-3" style={{ borderColor: LINE }}>
            {socialPanels.map((panel, i) => {
              const Icon = panel.icon;
              return (
                <a
                  key={panel.name}
                  href={panel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center px-4 py-8 text-center transition-colors duration-300 hover:bg-[#7D2F38] ${
                    i > 0 ? 'border-t sm:border-l sm:border-t-0' : ''
                  }`}
                  style={{ borderColor: LINE }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#7D2F38] transition-colors group-hover:border-[#F9DAA5] group-hover:bg-[#F9DAA5]">
                    <Icon className="h-6 w-6 text-[#7D2F38] transition-colors group-hover:text-[#3a1c20]" />
                  </div>
                  <h3
                    className="mt-4 text-xl text-[#7D2F38] transition-colors group-hover:text-[#F9DAA5]"
                    style={{ fontFamily: HEADING_FONT }}
                  >
                    {panel.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#3a1c20]/70 transition-colors group-hover:text-[#EBD6D0]">
                    {panel.handle}
                  </p>
                </a>
              );
            })}
          </div>

          {/* Instagram photo grid: 3 x 2 */}
          <div className="mt-8 grid grid-cols-3 gap-2 md:gap-3">
            {instagramImages.map((post, index) => (
              <a
                key={index}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden border p-1"
                style={{ borderColor: LINE }}
              >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{ backgroundColor: BLUSH }}>
                  {/* Shows through if the photo fails to load */}
                  <Instagram className="absolute h-7 w-7 opacity-40" style={{ color: MULBERRY }} />
                  <img
                    src={post.media_url}
                    alt="Presamali on Instagram"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="relative h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                    style={{ backgroundColor: 'rgba(125,47,56,0.65)' }}
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://www.instagram.com/presamali/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#7D2F38] px-9 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-[#7D2F38] transition hover:bg-[#7D2F38] hover:text-white"
            >
              Visit Instagram <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ---------- Right: Newsletter ---------- */}
      <div className="flex items-center px-5 py-16 md:px-10 md:py-24 lg:px-14" style={{ backgroundColor: PANEL }}>
        <div className="mx-auto w-full max-w-xl border p-2" style={{ borderColor: 'rgba(125,47,56,0.45)' }}>
          <div
            className="border px-6 py-14 text-center md:px-12 md:py-20"
            style={{ borderColor: 'rgba(125,47,56,0.25)' }}
          >
            <Logomark className="mx-auto mb-5 h-10 w-10" style={{ color: MULBERRY }} />
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: INK, opacity: 0.6 }}>
              The Letter
            </p>
            <h2 className="text-4xl leading-tight md:text-5xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
              Stay Connected with <em>Our Craft</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base md:text-lg" style={{ color: INK, opacity: 0.8 }}>
              Be the first to discover new Presamali collections, weaver stories, and special offers. Join our
              community of craft lovers.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-9 flex max-w-md flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                aria-label="Email address"
                className="w-full border-0 border-b-2 bg-transparent py-3 text-center text-lg outline-none placeholder:text-[#7D2F38]/50"
                style={{ borderColor: MULBERRY, color: INK, fontFamily: HEADING_FONT }}
              />
              <button
                type="submit"
                className="border border-[#7D2F38] bg-[#7D2F38] px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#7D2F38]"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-5 text-xs uppercase tracking-[0.15em]" style={{ color: INK, opacity: 0.55 }}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialNewsletter;