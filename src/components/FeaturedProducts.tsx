import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Eye, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCartContext';
import { useToast } from '@/hooks/use-toast';

/* ---------- Tokens ---------- */
const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const BODY_FONT = "'Nunito', ui-sans-serif, system-ui, sans-serif";
const INK = '#3a1c20';
const MULBERRY = '#7D2F38';
const REED = '#F9DAA5';
const WHITE = '#ffffff';
const AMBER = '#B45309';
const LINE = 'rgba(125,47,56,0.18)';
const PLACEHOLDER = '/placeholder.svg';
const WISHLIST_KEY = 'presamali_wishlist';

// Same green as the Shop page buttons
const SHOP_GREEN = '#7D2F38';
const SHOP_GREEN_DARK = '#0f5c0c';

// Where "Buy Now" sends the user after adding the item (same as Shop page).
const CHECKOUT_PATH = '/checkout';

// Soft blush backdrops behind category chips
const TINTS = ['#F6E9E4', '#F9EFE6', '#F3E3DE', '#F8ECE3', '#F4E6E1'];

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean;
  stock_quantity: number | null;
}

interface CategoryRow {
  name: string;
  slug?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
}

interface CategoryTileData {
  value: string; // matches products.category
  label: string;
  img?: string;
  count: number;
}

type Busy = { id: string; action: 'add' | 'buy' } | null;
type SortKey = 'featured' | 'low' | 'high';

const formatCategoryLabel = (value: string) =>
  value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const isSoldOut = (p: Product) => p.stock_quantity !== null && p.stock_quantity <= 0;
const isLowStock = (p: Product) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 5;
const unitPrice = (p: Product) => p.offer_price ?? p.price;
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const Logomark = ({ className = 'h-7 w-7', style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
    <path d="M24 6c-9.4 0-17 7.6-17 17s7.6 17 17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 6c9.4 0 17 7.6 17 17s-7.6 17-17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="24" cy="17" r="3.6" fill="currentColor" />
  </svg>
);

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
);

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, refreshCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [popId, setPopId] = useState<string | null>(null);
  const [quick, setQuick] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  /* ---------- Data ---------- */
  useEffect(() => {
    const load = async () => {
      const [featured, cats] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).eq('featured', true).limit(12),
        supabase.from('categories').select('*'),
      ]);

      if (featured.error) console.error('Featured products error:', featured.error);
      else setProducts((featured.data as Product[]) || []);

      if (cats.error) console.error('Categories error:', cats.error);
      else setCategoryRows(((cats.data as CategoryRow[]) || []).filter((c) => c.is_active !== false));

      setLoading(false);
    };
    load();
  }, []);

  /* ---------- Wishlist (saved in this browser) ---------- */
  const toggleWish = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    const adding = !wishlist.includes(id);
    setWishlist((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable: keep in memory only */
      }
      return next;
    });
    if (adding) {
      setPopId(id);
      window.setTimeout(() => setPopId((cur) => (cur === id ? null : cur)), 500);
    }
  };

  /* ---------- Quick view modal: Escape + scroll lock ---------- */
  const openQuick = (p: Product, e?: MouseEvent) => {
    e?.stopPropagation();
    setQty(1);
    setQuick(p);
  };

  useEffect(() => {
    if (!quick) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [quick]);

  /* ---------- Category chips: only categories with featured products ---------- */
  const tiles: CategoryTileData[] = useMemo(() => {
    const lookup = new Map<string, CategoryRow>();
    categoryRows.forEach((c) => {
      lookup.set((c.slug || c.name).toLowerCase(), c);
      lookup.set(c.name.toLowerCase(), c);
    });

    return Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c)))
      .sort()
      .map((value) => {
        const row = lookup.get(value.toLowerCase());
        return {
          value,
          label: row?.name || formatCategoryLabel(value),
          img: row?.image_url || undefined,
          count: products.filter((p) => p.category === value).length,
        };
      });
  }, [products, categoryRows]);

  const visibleProducts = useMemo(() => {
    const list = selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory);
    if (sort === 'low') return [...list].sort((a, b) => unitPrice(a) - unitPrice(b));
    if (sort === 'high') return [...list].sort((a, b) => unitPrice(b) - unitPrice(a));
    return list;
  }, [products, selectedCategory, sort]);

  /* ---------- Cart (no sign-in check) ---------- */
  const addItem = async (product: Product, quantity: number, e?: MouseEvent) => {
    e?.stopPropagation(); // don't open the product page
    if (busy || isSoldOut(product)) return;

    setBusy({ id: product.id, action: 'add' });
    try {
      await addToCart(product.id, quantity);
      toast({
        title: 'Added to cart',
        description: `${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`,
      });
      setAddedId(product.id);
      window.setTimeout(() => setAddedId((cur) => (cur === product.id ? null : cur)), 1800);
    } catch (error) {
      console.error('Add to cart failed:', error);
      toast({
        title: 'Error',
        description: "Couldn't add to cart.",
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  // Same flow as the Shop page: add to cart, refresh the cart, go to checkout
  const buyNow = async (product: Product, quantity: number, e?: MouseEvent) => {
    e?.stopPropagation();
    if (busy || isSoldOut(product)) return;

    setBusy({ id: product.id, action: 'buy' });
    try {
      await addToCart(product.id, quantity);
      await refreshCart();
      setQuick(null);
      navigate(CHECKOUT_PATH);
    } catch (error) {
      console.error('Buy now failed:', error);
      toast({
        title: 'Error',
        description: 'Unable to proceed.',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  /* ---------- Product card: same style as the Shop page ---------- */
  const renderCard = (product: Product, index: number) => {
    const price = unitPrice(product);
    const soldOut = isSoldOut(product);
    const low = isLowStock(product);
    const isAdding = busy?.id === product.id && busy.action === 'add';
    const isBuying = busy?.id === product.id && busy.action === 'buy';
    const justAdded = addedId === product.id;
    const wished = wishlist.includes(product.id);
    const popping = popId === product.id && wished;
    const open = () => navigate(`/product/${product.id}`);
    const discount =
      product.offer_price && product.price > product.offer_price
        ? Math.round(((product.price - product.offer_price) / product.price) * 100)
        : null;

    return (
      <article
        key={product.id}
        role="link"
        tabIndex={0}
        aria-label={product.name}
        onClick={open}
        onKeyDown={(e: ReactKeyboardEvent<HTMLElement>) => {
          if (e.target === e.currentTarget && e.key === 'Enter') open();
        }}
        className="pf-card group min-w-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7D2F38]"
        style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
      >
        {/* ----- Image ----- */}
        <div className="relative aspect-square bg-gray-50">
          <img
            src={product.image_url || PLACEHOLDER}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
            className={`h-full w-full object-cover ${soldOut ? 'opacity-40 grayscale' : ''}`}
          />

          {/* Discount tag */}
          {discount && !soldOut ? (
            <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white">
              {discount}% OFF
            </div>
          ) : null}

          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-md bg-gray-900 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Sold out
              </span>
            </div>
          )}

          {/* Icon stack (top-right): wishlist + quick view */}
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => toggleWish(product.id, e)}
              aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
              aria-pressed={wished}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 active:scale-90"
              style={{ color: MULBERRY }}
            >
              <Heart className={`h-4 w-4 ${popping ? 'pf-heart-pop' : ''}`} fill={wished ? MULBERRY : 'none'} />
            </button>
            <button
              type="button"
              onClick={(e) => openQuick(product, e)}
              aria-label={`Quick view ${product.name}`}
              title="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md transition hover:scale-110 active:scale-90"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Add button (bottom-right of photo, like the Shop page) */}
          {!soldOut && (
            <button
              type="button"
              onClick={(e) => addItem(product, 1, e)}
              disabled={!!busy}
              aria-label={`Add ${product.name} to cart`}
              className={`absolute bottom-2 right-2 flex min-w-[56px] items-center justify-center gap-1 rounded-lg border border-[#7D2F38] px-3 py-1.5 text-sm shadow-sm transition active:scale-95 disabled:opacity-60 ${
                justAdded
                  ? 'pf-added bg-[#7D2F38] text-white'
                  : 'bg-white text-[#7D2F38] hover:bg-[#7D2F38] hover:text-white'
              }`}
            >
              {isAdding ? (
                <Spinner />
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                'Add'
              )}
            </button>
          )}
        </div>

        {/* ----- Info ----- */}
        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">{product.name}</h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{inr(price)}</span>
            {product.offer_price && product.price > product.offer_price && (
              <span className="text-xs text-gray-400 line-through">{inr(product.price)}</span>
            )}
          </div>

          {low && (
            <p className="mt-1 text-xs font-bold" style={{ color: AMBER }}>
              Only {product.stock_quantity} left
            </p>
          )}

          {soldOut ? (
            <button
              type="button"
              disabled
              className="mt-3 w-full cursor-not-allowed rounded-lg bg-gray-200 py-2 text-gray-500"
            >
              Sold out
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => buyNow(product, 1, e)}
              disabled={!!busy}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#7D2F38] py-2 text-white transition hover:bg-[#0f5c0c] disabled:opacity-60"
            >
              {isBuying ? <Spinner /> : 'Buy Now'}
            </button>
          )}
        </div>
      </article>
    );
  };

  /* ---------- Quick view modal ---------- */
  const renderQuickView = () => {
    if (!quick) return null;
    const p = quick;
    const soldOut = isSoldOut(p);
    const maxQty = p.stock_quantity ?? 99;
    const lowStock = isLowStock(p);
    const isAdding = busy?.id === p.id && busy.action === 'add';
    const isBuying = busy?.id === p.id && busy.action === 'buy';
    const justAdded = addedId === p.id;
    const wished = wishlist.includes(p.id);

    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={`${p.name} quick view`}>
        <button aria-label="Close quick view" onClick={() => setQuick(null)} className="pf-fade absolute inset-0 bg-black/60" />

        <div
          className="pf-pop relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl border bg-white md:grid-cols-2 md:rounded-2xl"
          style={{ borderColor: LINE, fontFamily: BODY_FONT }}
        >
          <button
            onClick={() => setQuick(null)}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow"
            style={{ color: MULBERRY }}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="aspect-square bg-gray-50 md:aspect-auto md:min-h-[480px]">
            <img
              src={p.image_url || PLACEHOLDER}
              alt={p.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col p-6 md:p-9">
            {p.category && (
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: INK, opacity: 0.6 }}>
                {formatCategoryLabel(p.category)}
              </p>
            )}
            <h3 className="mt-2 text-3xl leading-tight md:text-4xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
              {p.name}
            </h3>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-extrabold text-gray-900">{inr(unitPrice(p))}</span>
              {p.offer_price && p.price > p.offer_price && (
                <>
                  <span className="text-base text-gray-400 line-through">{inr(p.price)}</span>
                  <span className="rounded bg-red-500 px-2 py-0.5 text-xs text-white">
                    {Math.round((1 - p.offer_price / p.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {p.description && (
              <p className="mt-5 line-clamp-5 text-sm leading-relaxed text-gray-700">{p.description}</p>
            )}

            {lowStock && (
              <p className="mt-4 text-xs font-bold" style={{ color: AMBER }}>
                Only {p.stock_quantity} left
              </p>
            )}

            {soldOut ? (
              <button
                type="button"
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-lg bg-gray-200 py-3 text-gray-500"
              >
                Sold out
              </button>
            ) : (
              <>
                <div className="mt-7 flex items-center gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-700">Qty</span>
                  <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-10 items-center justify-center text-[#7D2F38] transition hover:bg-black/5 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-base font-bold text-gray-900" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      disabled={qty >= maxQty}
                      aria-label="Increase quantity"
                      className="flex h-10 w-10 items-center justify-center text-[#7D2F38] transition hover:bg-black/5 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">= {inr(unitPrice(p) * qty)}</span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => addItem(p, qty)}
                    disabled={!!busy}
                    className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#7D2F38] text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60 ${
                      justAdded
                        ? 'pf-added bg-[#7D2F38] text-white'
                        : 'bg-white text-[#7D2F38] hover:bg-[#7D2F38] hover:text-white'
                    }`}
                  >
                    {isAdding ? (
                      <Spinner />
                    ) : justAdded ? (
                      <>
                        <Check className="h-4 w-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" /> Add to cart
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => buyNow(p, qty)}
                    disabled={!!busy}
                    className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#7D2F38] text-sm font-semibold text-white transition hover:bg-[#0f5c0c] active:scale-[0.98] disabled:opacity-60"
                  >
                    {isBuying ? <Spinner /> : 'Buy Now'}
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 flex items-center justify-between border-t pt-5" style={{ borderColor: LINE }}>
              <button
                type="button"
                onClick={() => toggleWish(p.id)}
                aria-pressed={wished}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition hover:opacity-70"
                style={{ color: MULBERRY }}
              >
                <Heart className="h-4 w-4" fill={wished ? MULBERRY : 'none'} />
                {wished ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuick(null);
                  navigate(`/product/${p.id}`);
                }}
                className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition hover:opacity-70"
                style={{ color: INK }}
              >
                Full details →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const chipBase =
    'flex flex-shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors hover:border-[#7D2F38]';

  return (
    // Full-bleed: breaks out of any max-width parent so no side gaps remain
    <section
      id="shop"
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ fontFamily: BODY_FONT, backgroundColor: WHITE }}
    >
      <style>{`
        @keyframes pfUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes pfFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pfPop { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes pfHeart { 0% { transform: scale(1); } 30% { transform: scale(1.45); } 60% { transform: scale(.88); } 100% { transform: scale(1); } }
        @keyframes pfAdded { 0% { transform: scale(.94); box-shadow: 0 0 0 0 rgba(20,113,15,.5); } 60% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(20,113,15,0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(20,113,15,0); } }
        .pf-card { animation: pfUp .6s cubic-bezier(.2,.7,.2,1) both; }
        .pf-fade { animation: pfFade .25s ease both; }
        .pf-pop { animation: pfPop .3s cubic-bezier(.2,.7,.2,1) both; }
        .pf-heart-pop { animation: pfHeart .45s ease; }
        .pf-added { animation: pfAdded .55s ease-out; }
        @keyframes stripScroll { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .pf-card, .pf-fade, .pf-pop, .pf-heart-pop, .pf-added { animation: none; } }
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        {/* Heading */}
        <div className="text-center">
          <Logomark className="mx-auto mb-4 h-8 w-8" style={{ color: MULBERRY }} />
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: INK, opacity: 0.6 }}>
            The Selection
          </p>
          <h2 className="text-4xl leading-tight md:text-6xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
            Featured Handwoven Pieces
          </h2>
        </div>

        {/* Filter bar: chips + sort */}
        <div className="mt-10 flex flex-col gap-4 border-y py-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: LINE }}>
          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-28 flex-shrink-0 animate-pulse rounded-full" style={{ backgroundColor: TINTS[i % TINTS.length] }} />
              ))
            ) : (
              <>
                <button
                  type="button"
                  aria-pressed={selectedCategory === 'all'}
                  onClick={() => setSelectedCategory('all')}
                  className={`${chipBase} pl-4`}
                  style={
                    selectedCategory === 'all'
                      ? { backgroundColor: MULBERRY, borderColor: MULBERRY, color: WHITE }
                      : { borderColor: LINE, color: INK }
                  }
                >
                  All <span className="text-xs opacity-60">{products.length}</span>
                </button>

                {tiles.map((t, i) => {
                  const selected = selectedCategory === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedCategory(selected ? 'all' : t.value)}
                      className={chipBase}
                      style={
                        selected
                          ? { backgroundColor: MULBERRY, borderColor: MULBERRY, color: WHITE }
                          : { borderColor: LINE, color: INK }
                      }
                    >
                      <span
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                        style={{ backgroundColor: TINTS[i % TINTS.length] }}
                      >
                        {t.img ? (
                          <img
                            src={t.img}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs italic" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
                            {t.label.charAt(0)}
                          </span>
                        )}
                      </span>
                      {t.label}
                      <span className="text-xs opacity-60">{t.count}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 md:justify-end">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: INK, opacity: 0.6 }}>
              {visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="border bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] outline-none focus:border-[#7D2F38]"
              style={{ borderColor: LINE, color: MULBERRY }}
            >
              <option value="featured" style={{ color: INK }}>Featured</option>
              <option value="low" style={{ color: INK }}>Price: Low to High</option>
              <option value="high" style={{ color: INK }}>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product grid (same columns as the Shop page) */}
        <div className="mt-8 md:mt-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="border px-6 py-16 text-center" style={{ borderColor: LINE }}>
              <p className="mb-5 text-2xl" style={{ fontFamily: HEADING_FONT, color: MULBERRY }}>
                No featured pieces in this category yet.
              </p>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="border px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] transition hover:bg-[#7D2F38] hover:text-white"
                  style={{ borderColor: MULBERRY, color: MULBERRY }}
                >
                  Show all pieces
                </button>
              )}
            </div>
          ) : (
            <div
              key={`${selectedCategory}-${sort}`}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {visibleProducts.map(renderCard)}
            </div>
          )}
        </div>

        <div className="mt-14 pb-2 text-center">
          <Link
            to="/shop"
            className="inline-block border px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] transition hover:bg-transparent hover:text-[#7D2F38]"
            style={{ backgroundColor: MULBERRY, borderColor: MULBERRY, color: WHITE }}
          >
            View all products
          </Link>
        </div>
      </div>

      {/* Scrolling brand strip (kept as a maroon band) */}
      <div className="mt-16 overflow-hidden py-5 md:mt-24 md:py-6" style={{ backgroundColor: MULBERRY }} aria-hidden="true">
        <div className="flex w-max animate-[stripScroll_35s_linear_infinite] whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`${k}-${i}`} className="flex items-center">
                  <Logomark className="mx-8 h-7 w-7" style={{ color: REED }} />
                  <span className="mr-8 text-3xl italic md:text-5xl" style={{ fontFamily: HEADING_FONT, color: REED }}>
                    Handwoven in Manipur
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {renderQuickView()}
    </section>
  );
};

export default FeaturedProducts;