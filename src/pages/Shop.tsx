import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { useCart } from '@/hooks/useCartContext';
import Layout from '../components/Layout';
import CartSidebar from '../components/CartSidebar';
import { Loader2, ShoppingCart, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useNavigate, useLocation } from 'react-router-dom';

/* ================= TYPES ================= */
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

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number | null;
}

interface GroupedProducts {
  [category: string]: Product[];
}

/* ================= SHOP ================= */
const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addToCart, cartCount, refreshCart } = useCart();

  /* ---------- Read category from URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category");
    if (categoryFromURL) setSelectedCategory(categoryFromURL);
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, categories, searchTerm, selectedCategory]);

  /* ---------- Fetch Categories ---------- */
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive"
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  /* ---------- Fetch Products ---------- */
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const getCategoryLabel = (slug: string | null) => {
    if (!slug) return 'Others';
    const match = categories.find(c => c.slug === slug);
    return match ? match.name : 'Others';
  };

  /* ---------- Filter Products ---------- */
  const filterProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(t) ||
          (p.description && p.description.toLowerCase().includes(t))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);

    const grouped = filtered.reduce((acc: any, product) => {
      const name = getCategoryLabel(product.category);

      if (!acc[name]) acc[name] = [];
      acc[name].push(product);
      return acc;
    }, {});

    setGroupedProducts(grouped);
  };

  /* ---------- Cart ---------- */
  const handleAddToCart = async (product: Product, e?: any) => {
    if (e) e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      await refreshCart();
      toast({ title: "Added!", description: `${product.name} added to cart.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add.",
        variant: "destructive"
      });
    }
  };

  const handleBuyNow = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      await refreshCart();
      navigate('/checkout');
    } catch {
      toast({
        title: "Error",
        description: "Unable to proceed.",
        variant: "destructive"
      });
    }
  };

  /* ---------- PRODUCT CARD ---------- */
  const renderProductCard = (product: Product) => {
    const price = product.offer_price ?? product.price;
    const discount = product.offer_price
      ? Math.round(((product.price - product.offer_price) / product.price) * 100)
      : null;

    return (
      <div
        key={product.id}
        onClick={() => navigate(`/product/${product.id}`)}
        className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
      >
        <div className="relative aspect-square bg-gray-50">
          <img
            src={product.image_url || "/placeholder.svg"}
            className="w-full h-full object-cover"
          />

          {discount && (
            <div className="absolute left-2 top-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}

          <button
            onClick={(e) => handleAddToCart(product, e)}
            className="absolute bottom-2 right-2 bg-white border border-[#14710F] text-[#14710F] px-3 py-1.5 rounded-lg text-sm shadow-sm hover:bg-[#14710F] hover:text-white transition"
          >
            Add
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold">₹{price}</span>
            {product.offer_price && (
              <span className="text-xs line-through text-gray-400">
                ₹{product.price}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(product);
            }}
            className="w-full mt-3 bg-[#14710F] text-white py-2 rounded-lg hover:bg-[#0f5c0c] transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  /* ================= RENDER ================= */
  return (
    <Layout>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* HERO */}
      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
        <p className="text-lg md:text-xl">
          Discover our carefully crafted collection
        </p>
      </section>

      {/* CATEGORY SECTION — BLINKIT STYLE */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-4">Shop by Categories</h2>

          {categoriesLoading ? (
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-8 md:gap-4">
              <CategoryTile
                label="All"
                value="all"
                img="/all.png"
                selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />

              {categories.map((cat) => (
                <CategoryTile
                  key={cat.id}
                  label={cat.name}
                  value={cat.slug}
                  img={cat.image_url || "/placeholder.svg"}
                  selected={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEARCH + FILTER */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            Object.entries(groupedProducts).map(([category, items]) => (
              <div key={category} className="mb-12">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {items.map(renderProductCard)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};

/* ================= CATEGORY TILE ================= */
function CategoryTile({
  img,
  label,
  value,
  selected,
  onClick,
}: {
  img: string;
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer flex flex-col items-center
        px-2 py-3 rounded-xl transition
        ${selected ? "bg-[#14710F]/10" : "bg-gray-50 hover:bg-gray-100"}
      `}
    >
      <div
        className={`
          w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center
          ${selected ? "ring-2 ring-[#14710F]" : ""}
        `}
      >
        <img src={img} className="w-full h-full object-cover" />
      </div>

      <span
        className={`
          mt-2 text-[11px] font-medium text-center leading-tight
          ${selected ? "text-[#14710F]" : "text-gray-700"}
        `}
      >
        {label}
      </span>
    </div>
  );
}

export default Shop;