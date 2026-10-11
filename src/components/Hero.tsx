import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const DEEP = '#2b1115';
const MULBERRY = '#7D2F38';
const REED = '#F9DAA5';
const BLUSH = '#EBD6D0';

// Swap for your own image, e.g. '/hero-bg.jpg' (file in /public)
const FALLBACK_BG =
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1920&h=1080&fit=crop';

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  banner_height: number | null;
  banner_width: number | null;
  text_position: string | null;
  image_position: string | null;
  overlay_opacity: number | null;
}

const textPositionClasses: Record<string, string> = {
  'top-left': 'items-start justify-start text-left',
  'top-center': 'items-start justify-center text-center',
  'top-right': 'items-start justify-end text-right',
  'center-left': 'items-center justify-start text-left',
  center: 'items-center justify-center text-center',
  'center-right': 'items-center justify-end text-right',
  'bottom-left': 'items-end justify-start text-left',
  'bottom-center': 'items-end justify-center text-center',
  'bottom-right': 'items-end justify-end text-right',
};

const Logomark = ({ className = 'h-7 w-7', style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const HeroButton = ({
  text,
  link,
  variant,
  onLight = false,
}: {
  text?: string | null;
  link?: string | null;
  variant: 'solid' | 'ghost';
  /** true when the button sits on a white background (maroon styling) */
  onLight?: boolean;
}) => {
  // Optional: no text, no button
  if (!text || !text.trim()) return null;

  const base = 'inline-block border px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition';
  const styles = onLight
    ? variant === 'solid'
      ? 'border-[#7D2F38] bg-[#7D2F38] text-white hover:bg-transparent hover:text-[#7D2F38]'
      : 'border-[#7D2F38] text-[#7D2F38] hover:bg-[#7D2F38] hover:text-white'
    : variant === 'solid'
      ? 'border-[#F9DAA5] bg-[#F9DAA5] text-[#3a1c20] hover:bg-transparent hover:text-[#F9DAA5]'
      : 'border-[#F9DAA5] text-[#F9DAA5] hover:bg-[#F9DAA5] hover:text-[#3a1c20]';
  const className = `${base} ${styles}`;

  const href = (link || '').trim() || '#';

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {text}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {text}
    </Link>
  );
};

/** Shown when there are no live banners: text left, arched photo right */
const FallbackHero = () => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="relative overflow-hidden bg-white" style={{ fontFamily: BODY_FONT }}>
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl"
        style={{ backgroundColor: BLUSH }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="text-center md:text-left">
          <Logomark className="mx-auto mb-6 h-10 w-10 md:mx-0" style={{ color: MULBERRY }} />
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: INK, opacity: 0.6 }}>
            Kouna &amp; Accessories
          </p>
          <h1 className="text-5xl leading-[1.02] md:text-7xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
            Woven by hand,
            <br />
            <em style={{ color: INK }}>worn for years.</em>
          </h1>
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed md:mx-0" style={{ color: INK, opacity: 0.75 }}>
            Reed-grass craft from the women weavers of Manipur, shaped into pieces you will actually keep.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4 md:justify-start">
            <HeroButton text="Shop the collection" link="/shop" variant="solid" onLight />
            <HeroButton text="Our story" link="/about" variant="ghost" onLight />
          </div>
        </div>

        {/* Arched photo with offset maroon outline */}
        <div className="relative mx-auto w-full max-w-md">
          <div
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-md border"
            style={{ borderColor: MULBERRY, opacity: 0.4 }}
          />
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-md"
            style={{ background: `linear-gradient(160deg, ${BLUSH}, ${REED})` }}
          >
            {!imgFailed && (
              <img
                src={FALLBACK_BG}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('banner_settings')
          .select('*')
          .eq('is_active', true)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('[Hero] Failed to load banners:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.warn(
            '[Hero] 0 banners returned. Check that a banner is Active + Published, and that banner_settings has a public SELECT policy (RLS).'
          );
        }

        setBanners((data as HeroBanner[]) || []);
      } catch (err) {
        console.error('[Hero] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return <section className="h-[75vh] min-h-[460px] w-full animate-pulse bg-[#F6EDE9]" />;
  }

  if (banners.length === 0) {
    return <FallbackHero />;
  }

  const active = banners[current] ?? banners[0];

  return (
    <section className="relative w-full bg-white" style={{ fontFamily: BODY_FONT }}>
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          height: `${active.banner_height ?? 500}px`,
          width: `${active.banner_width ?? 100}%`,
        }}
      >
        {banners.map((banner, index) => {
          const overlay = (banner.overlay_opacity ?? 40) / 100;
          const position =
            textPositionClasses[banner.text_position || 'center'] || textPositionClasses.center;
          const hasButtons = !!banner.button_text?.trim() || !!banner.secondary_button_text?.trim();

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={index !== current}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="h-full w-full object-cover"
                style={{ objectPosition: banner.image_position || 'center' }}
              />
              {/* Text sits on the photo, so the overlay + light text stay */}
              <div className="absolute inset-0" style={{ backgroundColor: DEEP, opacity: overlay }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2b1115]/70 via-transparent to-transparent" />

              {/* Gold inset frame */}
              <div
                className="pointer-events-none absolute inset-3 border md:inset-5"
                style={{ borderColor: 'rgba(249,218,165,0.45)' }}
              />

              <div className={`absolute inset-0 flex px-10 py-14 md:px-24 md:py-16 ${position}`} style={{ color: REED }}>
                <div className="max-w-2xl space-y-5">
                  <h1 className="text-4xl leading-tight md:text-6xl" style={{ fontFamily: HEADING_FONT }}>
                    {banner.title}
                  </h1>
                  {banner.subtitle && (
                    <p className="text-base md:text-lg" style={{ color: BLUSH }}>
                      {banner.subtitle}
                    </p>
                  )}
                  {hasButtons && (
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                      <HeroButton text={banner.button_text} link={banner.button_link} variant="solid" />
                      <HeroButton text={banner.secondary_button_text} link={banner.secondary_button_link} variant="ghost" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2.5">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: index === current ? 32 : 8,
                  backgroundColor: index === current ? REED : 'rgba(249,218,165,0.4)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;