import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Package,
  LogOut,
  Home,
  Upload,
  Search,
  X,
  ClipboardList,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  AlertTriangle,
  Loader2,
  SearchX,
  type LucideIcon,
} from 'lucide-react';
import OrderManagement from '@/components/OrderManagement';
import BannerManagement from '@/components/BannerManagement';
import ProductList from '@/components/ProductManagementComponents/ProductList';
import ProductForm from '@/components/ProductManagementComponents/ProductForm';
import CSVUpload from '@/components/ProductManagementComponents/CSVUpload';
import { Product } from '@/types/product';

type ProductFilter = 'all' | 'active' | 'inactive' | 'featured' | 'out_of_stock';

const FILTERS: { value: ProductFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'featured', label: 'Featured' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const STAT_TONES = {
  brand: 'bg-[#7D2F38]/10 text-[#7D2F38]',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: keyof typeof STAT_TONES;
  onClick?: () => void;
}

const StatCard = ({ icon: Icon, label, value, tone, onClick }: StatCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D2F38]/40"
  >
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${STAT_TONES[tone]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
    </div>
  </button>
);

const ProductManagement = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProductFilter>('all');
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    name: '',
    description: null,
    price: 0,
    offer_price: null,
    image_url: null,
    image_urls: null,
    category: null,
    features: null,
    ingredients: null,
    offers: null,
    stock_quantity: 0,
    is_active: true,
    featured: false,
    created_at: null as any,
    updated_at: null as any,
  } as Product);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth?admin=true');
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch products
  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  // Close the bulk upload modal with the Escape key
  useEffect(() => {
    if (!showCSVUpload) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCSVUpload(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCSVUpload]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const existingImages: string[] = [];
    if (product.image_url) existingImages.push(product.image_url as string);
    if (product.image_urls && Array.isArray(product.image_urls)) {
      existingImages.push(...(product.image_urls as string[]));
    }
    setEditingImages(existingImages);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingImages([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      setProducts(products.filter((product) => product.id !== id));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  /**
   * sanitizeProductPayload
   * - removes properties whose value is an empty string ("")
   * - converts empty arrays to null (so DB won't receive [])
   * - leaves null values intact
   * - returns Partial<Product>
   */
  const sanitizeProductPayload = (payload: Record<string, any>): Partial<Product> => {
    const cleaned: Partial<Product> = {};
    Object.entries(payload).forEach(([k, v]) => {
      if (v === '') return;
      if (Array.isArray(v) && v.length === 0) {
        (cleaned as any)[k] = null;
        return;
      }
      if (v === undefined) return;
      (cleaned as any)[k] = v;
    });
    return cleaned;
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const productData = {
        ...editingProduct,
        image_url: editingImages.length > 0 ? editingImages[0] : null,
        image_urls: editingImages.length > 1 ? editingImages.slice(1) : null,
        // updated_at: new Date().toISOString(), // optional client timestamp
      };

      const payload = sanitizeProductPayload(productData);

      // CAST HERE to satisfy Supabase/TypeScript overloads:
      // we sanitized payload at runtime; now tell TS it matches Product shape.
      const { data, error } = await supabase
        .from('products')
        .update(payload as unknown as Product)
        .eq('id', editingProduct.id)
        .select();

      if (error) throw error;

      const updatedRow = Array.isArray(data) && data[0] ? (data[0] as Product) : ({ ...editingProduct, ...productData } as Product);

      setProducts(products.map((product) => (product.id === editingProduct.id ? updatedRow : product)));
      setEditingProduct(null);
      setEditingImages([]);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async () => {
    try {
      const productData = {
        ...newProduct,
        image_url: newProductImages.length > 0 ? newProductImages[0] : null,
        image_urls: newProductImages.length > 1 ? newProductImages.slice(1) : null,
        // created_at: new Date().toISOString(), // optional client timestamp
      };

      const payload = sanitizeProductPayload(productData);

      // CAST HERE to satisfy Supabase/TypeScript overloads:
      const { data, error } = await supabase
        .from('products')
        .insert([payload as unknown as Product])
        .select();

      if (error) throw error;

      const created = Array.isArray(data) && data[0] ? (data[0] as Product) : (payload as Product);

      setProducts([created, ...products]);
      setIsCreating(false);
      setNewProductImages([]);
      setNewProduct({
        id: '',
        name: '',
        description: null,
        price: 0,
        offer_price: null,
        image_url: null,
        image_urls: null,
        category: null,
        features: null,
        ingredients: null,
        offers: null,
        stock_quantity: 0,
        is_active: true,
        featured: false,
        created_at: null as any,
        updated_at: null as any,
      } as Product);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  const handleCSVProductsUploaded = (uploadedProducts: Product[]) => {
    setProducts([...uploadedProducts, ...products]);
    setShowCSVUpload(false);
  };

  /* ================= STATS & FILTERING ================= */

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.is_active).length,
      featured: products.filter((p) => p.featured).length,
      outOfStock: products.filter((p) => (p.stock_quantity ?? 0) <= 0).length,
    }),
    [products]
  );

  const filterCounts: Record<ProductFilter, number> = {
    all: stats.total,
    active: stats.active,
    inactive: stats.total - stats.active,
    featured: stats.featured,
    out_of_stock: stats.outOfStock,
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        !query ||
        (p.name || '').toLowerCase().includes(query) ||
        String(p.category || '').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'active':
          return !!p.is_active;
        case 'inactive':
          return !p.is_active;
        case 'featured':
          return !!p.featured;
        case 'out_of_stock':
          return (p.stock_quantity ?? 0) <= 0;
        default:
          return true;
      }
    });
  }, [products, searchQuery, activeFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || activeFilter !== 'all';

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#7D2F38]" />
          <p className="font-medium text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const adminInitial = (user.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#7D2F38] to-[#5A1F27] text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-white/70">Manage your products, orders, and website content</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 md:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#7D2F38]">
                  {adminInitial}
                </span>
                <span className="max-w-[160px] truncate text-sm text-white/90">{user.email}</span>
              </div>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2 border-white/30 bg-white/10 text-white transition-all hover:bg-white/20 hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2 border-white/30 bg-white/10 text-white transition-all hover:bg-white hover:text-[#7D2F38]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border bg-white p-1.5 shadow-sm sm:w-auto">
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-all hover:text-[#7D2F38] data-[state=active]:bg-[#7D2F38] data-[state=active]:text-white data-[state=active]:shadow"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-all hover:text-[#7D2F38] data-[state=active]:bg-[#7D2F38] data-[state=active]:text-white data-[state=active]:shadow"
            >
              <Package className="h-4 w-4" />
              Products
              {products.length > 0 && (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold">{products.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="banner"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-all hover:text-[#7D2F38] data-[state=active]:bg-[#7D2F38] data-[state=active]:text-white data-[state=active]:shadow"
            >
              <ImageIcon className="h-4 w-4" />
              Banner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="animate-in fade-in-50 duration-300">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="banner" className="animate-in fade-in-50 duration-300">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Stats - click one to filter the list */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard icon={Package} label="Total products" value={stats.total} tone="brand" onClick={() => setActiveFilter('all')} />
              <StatCard icon={CheckCircle2} label="Active" value={stats.active} tone="green" onClick={() => setActiveFilter('active')} />
              <StatCard icon={Star} label="Featured" value={stats.featured} tone="amber" onClick={() => setActiveFilter('featured')} />
              <StatCard icon={AlertTriangle} label="Out of stock" value={stats.outOfStock} tone="red" onClick={() => setActiveFilter('out_of_stock')} />
            </div>

            {/* Toolbar */}
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Products</h2>
                  <p className="text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products.length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => setShowCSVUpload(true)}
                    variant="outline"
                    className="flex items-center gap-2 transition-all hover:border-[#7D2F38] hover:text-[#7D2F38]"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Bulk Upload</span>
                  </Button>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-[#7D2F38] text-white shadow-sm transition-all hover:bg-[#5A1F27] hover:shadow-md active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or category..."
                  className="pl-10 pr-10 focus-visible:ring-[#7D2F38]/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                        isActive
                          ? 'border-[#7D2F38] bg-[#7D2F38] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#7D2F38]/50 hover:text-[#7D2F38]'
                      }`}
                    >
                      {filter.label}
                      <span
                        className={`rounded-full px-1.5 text-xs ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {filterCounts[filter.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List / empty search state */}
            {!loadingProducts && products.length > 0 && filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white px-4 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2F38]/10 text-[#7D2F38]">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Nothing matches your current search or filter. Try a different keyword or reset the filters.
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-5 transition-all hover:border-[#7D2F38] hover:text-[#7D2F38]"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <ProductList products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} loading={loadingProducts} />
            )}
          </TabsContent>
        </Tabs>

        {/* CSV Upload Modal */}
        {showCSVUpload && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowCSVUpload(false)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowCSVUpload(false)}
                aria-label="Close bulk upload"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
              <CSVUpload onProductsUploaded={handleCSVProductsUploaded} />
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            images={editingImages}
            onProductChange={setEditingProduct}
            onImagesChange={setEditingImages}
            onSave={handleUpdate}
            onCancel={handleCancelEdit}
            isEditing={true}
          />
        )}

        {/* Create Product Modal */}
        {isCreating && (
          <ProductForm
            product={newProduct}
            images={newProductImages}
            onProductChange={setNewProduct}
            onImagesChange={setNewProductImages}
            onSave={handleCreate}
            onCancel={() => {
              setIsCreating(false);
              setNewProductImages([]);
            }}
            isEditing={false}
          />
        )}
      </main>
    </div>
  );
};

export default ProductManagement;