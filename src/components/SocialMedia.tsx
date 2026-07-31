import { useState, useEffect } from 'react';
import { Instagram, MessageCircle, Facebook } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CORAL = "#E79F8A";
const REED = "#F9DAA5";
const CLAY = "#F1E4E0";

// NOTE: update handles/links below to your real accounts.
const socialPanels = [
  {
    name: 'Instagram',
    handle: '@presamali',
    icon: Instagram,
    href: 'https://www.instagram.com/presamali/',
    accent: '#E79F8A',
  },
  {
    name: 'WhatsApp',
    handle: 'Chat with us',
    icon: MessageCircle,
    href: 'https://wa.link/vuxv1f',
    accent: '#F9DAA5',
  },
  {
    name: 'Facebook',
    handle: 'Presamali',
    icon: Facebook,
    href: 'https://www.facebook.com/',
    accent: '#EBD6D0',
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
    <section className="py-20" style={{ backgroundColor: CLAY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] uppercase mb-3 block" style={{ color: CORAL }}>
            Community
          </span>
          <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: HEADING_FONT, color: '#2B1418' }}>
            Follow Our Journey
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#5c3238' }}>
            Behind-the-scenes weaving, new arrivals, and stories from our
            artisans — find us wherever you scroll.
          </p>
        </div>

        {/* Social platform panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {socialPanels.map((panel) => {
            const Icon = panel.icon;
            return (
              <a
                key={panel.name}
                href={panel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: panel.accent }}
                >
                  <Icon className="h-6 w-6" style={{ color: MULBERRY }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#2B1418' }}>{panel.name}</h3>
                  <p className="text-sm" style={{ color: '#5c3238' }}>{panel.handle}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Instagram photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {instagramImages.map((post, index) => (
            <a
              key={index}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-xl shadow-sm aspect-square block"
            >
              <img
                src={post.media_url}
                alt="Presamali on Instagram"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                style={{ backgroundColor: `${MULBERRY}66` }}
              >
                <Instagram className="h-6 w-6 text-white" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/presamali/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white px-8 py-3 rounded-full font-semibold transition shadow-lg hover:shadow-xl"
            style={{ backgroundColor: MULBERRY }}
          >
            Visit Instagram →
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;