import { Link } from 'react-router-dom';
import { Users, Award, Heart } from 'lucide-react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const MULBERRY = '#7D2F38';
const BLUSH = '#EBD6D0';
const LINE = 'rgba(125,47,56,0.18)';

const facts = [
  { icon: Users, title: 'Women-Led', text: 'Weavers across Manipur' },
  { icon: Award, title: 'Generations', text: 'Of Kouna weaving technique' },
  { icon: Heart, title: 'Handwoven', text: 'Every single piece' },
];

const StoryPreview = () => {
  return (
    <section id="story" className="relative overflow-hidden bg-white py-20 md:py-28" style={{ fontFamily: BODY_FONT }}>
      <div
        className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ backgroundColor: BLUSH }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Arched photo + quote */}
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              <div
                className="absolute inset-0 -translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-md border"
                style={{ borderColor: MULBERRY, opacity: 0.4 }}
              />
              <img
                src="/photo2.jpg"
                alt="Kouna weaving artisan at work"
                className="relative aspect-[4/5] w-full rounded-b-md rounded-t-[999px] object-cover"
              />
            </div>

            <figure className="mx-auto mt-12 max-w-md text-center">
              <blockquote className="text-2xl italic leading-snug" style={{ fontFamily: HEADING_FONT, color: INK }}>
                “Every piece tells a story of patience, tradition, and the hands that made it.”
              </blockquote>
              <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: MULBERRY }}>
                Ibemhal, Kouna Weaver
              </figcaption>
            </figure>
          </div>

          {/* Copy */}
          <div className="order-1 text-center lg:order-2 lg:text-left">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: INK, opacity: 0.6 }}>
              The Makers
            </p>
            <h2 className="text-4xl leading-[1.05] md:text-6xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
              Crafted with Heritage,
              <em className="block" style={{ color: INK }}>
                Made with Heart
              </em>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed lg:mx-0" style={{ color: INK, opacity: 0.8 }}>
              Presamali works with women weavers across Manipur to keep Kouna craft alive. Every piece in our
              collection carries the spirit of its maker and the wisdom of a technique passed down through
              generations.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {facts.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="text-center">
                    <div
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                      style={{ borderColor: MULBERRY }}
                    >
                      <Icon className="h-7 w-7" style={{ color: MULBERRY }} />
                    </div>
                    <h3 className="mt-4 text-xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: INK, opacity: 0.7 }}>
                      {f.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 border-t pt-10" style={{ borderColor: LINE }}>
              <Link
                to="/about"
                className="inline-block border border-[#7D2F38] bg-[#7D2F38] px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#7D2F38]"
              >
                Read Our Full Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryPreview;