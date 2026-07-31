import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCartContext';
import { useToast } from '@/hooks/use-toast';

const HEADING_FONT = "'Americana BT', 'Fraunces', Georgia, serif";
const MULBERRY = "#7D2F38";
const CLAY = "#F1E4E0";

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

const badgeStyle = (label: string) => {
  if (label === 'Sale') return { backgroundColor: '#7D2F3820', color: MULBERRY };
  if (label === 'New') return { backgroundColor: '#EBD6D0', color: MULBERRY };
  return { backgroundColor: '#F9DAA5', color: MULBERRY };
};

// Turns a raw category value like "home_decor" into "Home Decor" for display.
const formatCategoryLabel = (value: string) =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, refreshCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .limit(12);

    if (!error) setProducts(data || []);
  };

  // Categories come from the actual `category` values on active products in
  // Supabase — not a hardcoded list — so the tabs always reflect what's
  // really in the catalog.
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (!error && data) {
      const unique = Array.from(
        new Set(data.map((p) => p.category).filter((c): c is string => !!c))
      ).sort();
      setCategories(unique);
    }
  };

  const visibleProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      toast({ title: 'Added!', description: `${product.name} added to cart.` });
      await refreshCart();
    } catch {
      toast({ title: 'Error', description: 'Failed to add.', variant: 'destructive' });
    }
  };

  return (
    <section id="shop" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase mb-3 block" style={{ color: '#E79F8A' }}>
            The Collection
          </span>
          <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: HEADING_FONT, color: '#2B1418' }}>
            Featured Handwoven Pieces
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#5c3238' }}>
            Each piece is woven by hand from natural Kouna reed, selected for
            its craftsmanship, character, and the story it carries.
          </p>
        </div>

        {/* Category tabs — built from live product categories, not hardcoded */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['all', ...categories].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                style={
                  isActive
                    ? { backgroundColor: MULBERRY, color: 'white' }
                    : { backgroundColor: CLAY, color: '#5c3238' }
                }
              >
                {cat === 'all' ? 'All' : formatCategoryLabel(cat)}
              </button>
            );
          })}
        </div>

        {visibleProducts.length === 0 && (
          <p className="text-center py-12" style={{ color: '#5c3238' }}>
            No products in this category yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleProducts.map((product) => {
            const price = product.offer_price ?? product.price;
            const discount = product.offer_price
              ? Math.round(((product.price - product.offer_price) / product.price) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative overflow-hidden rounded-2xl mb-4" style={{ backgroundColor: CLAY }}>
                  {discount && (
                    <div
                      className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold rounded-full"
                      style={badgeStyle('Sale')}
                    >
                      {discount}% OFF
                    </div>
                  )}

                  <button
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Save to wishlist"
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Heart className="h-4 w-4" style={{ color: MULBERRY }} />
                  </button>

                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="px-6 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: 'white', color: MULBERRY }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold mb-2 transition-colors duration-200" style={{ color: '#2B1418' }}>
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold" style={{ color: '#2B1418' }}>₹{price}</span>
                    {product.offer_price && (
                      <span className="text-sm line-through" style={{ color: '#a0777d' }}>₹{product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: MULBERRY }}
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;