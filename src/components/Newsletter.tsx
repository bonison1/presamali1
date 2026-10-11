import { useState, type CSSProperties } from 'react';
import type { FormEvent } from 'react';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const MULBERRY = '#7D2F38';
const REED = '#F9DAA5';
const BLUSH = '#EBD6D0';

const Logomark = ({ className = 'h-7 w-7', style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="px-4 py-16 md:py-24" style={{ backgroundColor: MULBERRY, fontFamily: BODY_FONT }}>
      <div
        className="mx-auto max-w-3xl border p-2"
        style={{ borderColor: 'rgba(249,218,165,0.55)' }}
      >
        <div
          className="border px-6 py-14 text-center md:px-14 md:py-16"
          style={{ borderColor: 'rgba(249,218,165,0.3)' }}
        >
          <Logomark className="mx-auto mb-5 h-10 w-10" style={{ color: REED }} />
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: BLUSH, opacity: 0.8 }}>
            The Letter
          </p>
          <h2 className="text-4xl leading-tight md:text-5xl" style={{ fontFamily: HEADING_FONT, color: REED }}>
            Stay Connected with <em>Our Craft</em>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base md:text-lg" style={{ color: BLUSH }}>
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
              className="w-full border-0 border-b-2 bg-transparent py-3 text-center text-lg outline-none placeholder:text-[#EBD6D0]/50"
              style={{ borderColor: REED, color: REED, fontFamily: HEADING_FONT }}
            />
            <button
              type="submit"
              className="px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition hover:opacity-90"
              style={{ backgroundColor: REED, color: INK }}
            >
              Subscribe
            </button>
          </form>

          <p className="mt-5 text-xs uppercase tracking-[0.15em]" style={{ color: BLUSH, opacity: 0.7 }}>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;