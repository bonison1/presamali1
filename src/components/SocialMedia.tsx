import { useState, useEffect, type CSSProperties } from 'react';
import { Instagram, MessageCircle, Facebook } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const MULBERRY = '#7D2F38';
const REED = '#F9DAA5';
const BLUSH = '#EBD6D0';
const LINE = 'rgba(249,218,165,0.25)';

// NOTE: update handles/links below to your real accounts.
const socialPanels = [
  {
    name: 'Instagram',
    handle: '@presamali',
    icon: Instagram,
    href: 'https://www.instagram.com/presamali/',
  },
  {
    name: 'WhatsApp',
    handle: 'Chat with us',
    icon: MessageCircle,
    href: 'https://wa.link/',
  },
  {
    name: 'Facebook',
    handle: 'Presamali',
    icon: Facebook,
    href: 'https://www.facebook.com/',
  },
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

const SocialMedia = () => {
  const [instagramImages, setInstagramImages] = useState<{ media_url: string; permalink: string }[]>([]);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

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

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: INK, fontFamily: BODY_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Logomark className="mx-auto mb-4 h-8 w-8" style={{ color: REED }} />
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: BLUSH, opacity: 0.75 }}>
            Community
          </p>
          <h2 className="text-4xl md:text-6xl" style={{ fontFamily: HEADING_FONT, color: REED }}>
            Follow Our Journey
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: BLUSH, opacity: 0.85 }}>
            Behind-the-scenes weaving, new arrivals, and stories from our artisans — find us wherever you scroll.
          </p>
        </div>

        {/* Social platform panels */}
        <div className="mt-14 grid grid-cols-1 border sm:grid-cols-3" style={{ borderColor: LINE }}>
          {socialPanels.map((panel, i) => {
            const Icon = panel.icon;
            return (
              <a
                key={panel.name}
                href={panel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center px-6 py-10 text-center transition-colors duration-300 hover:bg-[#7D2F38] ${
                  i > 0 ? 'border-t sm:border-l sm:border-t-0' : ''
                }`}
                style={{ borderColor: LINE }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border transition-colors group-hover:bg-[#F9DAA5]"
                  style={{ borderColor: REED }}
                >
                  <Icon className="h-7 w-7 transition-colors group-hover:text-[#3a1c20]" style={{ color: REED }} />
                </div>
                <h3 className="mt-5 text-2xl" style={{ fontFamily: HEADING_FONT, color: REED }}>
                  {panel.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: BLUSH, opacity: 0.8 }}>
                  {panel.handle}
                </p>
              </a>
            );
          })}
        </div>

        {/* Instagram photo grid */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {instagramImages.map((post, index) => (
            <a
              key={index}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden border p-1.5"
              style={{ borderColor: LINE }}
            >
              <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: MULBERRY }}>
                <img
                  src={post.media_url}
                  alt="Presamali on Instagram"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                  style={{ backgroundColor: 'rgba(58,28,32,0.65)' }}
                >
                  <Instagram className="h-6 w-6" style={{ color: REED }} />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/presamali/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] transition hover:bg-[#F9DAA5] hover:text-[#3a1c20]"
            style={{ borderColor: REED, color: REED }}
          >
            Visit Instagram →
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;