import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Save,
  X,
  Plus,
  Minus,
  Pencil,
  PackagePlus,
  Loader2,
  Check,
  Star,
  Eye,
  Tag,
  AlertCircle,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface ProductFormProps {
  product: Product;
  images: string[];
  onProductChange: (product: Product) => void;
  onImagesChange: (images: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  saving?: boolean;
}

const LOW_STOCK_THRESHOLD = 5;

// "Red Meat" -> "red_meat" (same style as the existing category values)
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

// The categories table is new, so the generated Supabase types don't know it yet.
// After running the SQL, regenerate your types and you can drop the `as any`.
const categoriesTable = () => (supabase as any).from('categories');

/* ---------- small presentational helpers ---------- */

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
    </div>
    {children}
  </section>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="flex items-center gap-1 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-150">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  ) : null;

const ToggleCard = ({
  id,
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label
    htmlFor={id}
    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
      checked
        ? 'border-[#7D2F38]/50 bg-[#7D2F38]/5'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          checked ? 'bg-[#7D2F38] text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-[#7D2F38]"
    />
  </label>
);

const ProductForm = ({
  product,
  images,
  onProductChange,
  onImagesChange,
  onSave,
  onCancel,
  isEditing,
  saving
}: ProductFormProps) => {
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImages, setCategoryImages] = useState<string[]>([]);
  const [savingCategory, setSavingCategory] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Used to warn before closing a form with unsaved changes
  const [initialSnapshot] = useState(() => JSON.stringify({ product, images }));
  const isDirty = JSON.stringify({ product, images }) !== initialSnapshot;

  // Track where a click started so dragging (e.g. selecting text) and releasing
  // on the backdrop doesn't close the form
  const backdropPressed = useRef(false);

  const requestClose = () => {
    if (saving || savingCategory) return;
    if (isDirty && !window.confirm('Discard your changes?')) return;
    onCancel();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lock page scroll while the form is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Esc closes the category panel first, then the form
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || saving || savingCategory) return;
      if (showCategoryPanel) {
        closeCategoryPanel();
      } else {
        requestClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCategoryPanel, saving, savingCategory, isDirty, onCancel]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await categoriesTable()
        .select('id, name, slug, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories((data as Category[]) || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedCategory = categories.find((c) => c.slug === product.category);
  const legacyCategory =
    !loadingCategories && product.category && !selectedCategory ? String(product.category) : null;
  const categoryLabel =
    selectedCategory?.name ||
    (product.category ? String(product.category).replace(/_/g, ' ') : '');

  const openCreatePanel = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImages([]);
    setShowCategoryPanel(true);
  };

  const openEditPanel = () => {
    if (!selectedCategory) return;
    setEditingCategory(selectedCategory);
    setCategoryName(selectedCategory.name);
    setCategoryImages(selectedCategory.image_url ? [selectedCategory.image_url] : []);
    setShowCategoryPanel(true);
  };

  function closeCategoryPanel() {
    setShowCategoryPanel(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImages([]);
  }

  const handleSaveCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      toast({
        title: 'Category name required',
        description: 'Please enter a name for the category',
        variant: 'destructive',
      });
      return;
    }

    setSavingCategory(true);

    try {
      const imageUrl = categoryImages[0] ?? null;

      if (editingCategory) {
        // Update name / photo (slug stays the same so existing products keep working)
        const { data, error } = await categoriesTable()
          .update({ name, image_url: imageUrl })
          .eq('id', editingCategory.id)
          .select('id, name, slug, image_url')
          .single();

        if (error) throw error;

        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? (data as Category) : c)));
        toast({ title: 'Category updated', description: `${name} has been updated` });
      } else {
        const slug = slugify(name);

        if (!slug) {
          toast({
            title: 'Invalid name',
            description: 'Please use letters or numbers in the category name',
            variant: 'destructive',
          });
          return;
        }

        if (categories.some((c) => c.slug === slug)) {
          toast({
            title: 'Category already exists',
            description: `A category named "${name}" already exists`,
            variant: 'destructive',
          });
          return;
        }

        const { data, error } = await categoriesTable()
          .insert({ name, slug, image_url: imageUrl })
          .select('id, name, slug, image_url')
          .single();

        if (error) throw error;

        const created = data as Category;
        setCategories((prev) => [...prev, created]);

        // Select the new category on this product straight away
        onProductChange({ ...product, category: created.slug as any });
        toast({ title: 'Category added', description: `${name} has been added` });
      }

      closeCategoryPanel();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setSavingCategory(false);
    }
  };

  /* ---------- validation & derived values ---------- */

  const price = product.price as number;
  const offerPrice = product.offer_price as number | null;
  const hasOffer = offerPrice != null && !Number.isNaN(offerPrice) && offerPrice > 0;
  const stock = product.stock_quantity ?? 0;

  const errors = {
    name: !product.name?.trim() ? 'Product name is required' : '',
    price: price == null || Number.isNaN(price) || price <= 0 ? 'Enter a price greater than 0' : '',
    offer_price:
      hasOffer && price > 0 && (offerPrice as number) >= price ? 'Offer price must be lower than the price' : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const discountPercent =
    hasOffer && price > 0 && (offerPrice as number) < price
      ? Math.round((1 - (offerPrice as number) / price) * 100)
      : 0;

  const handleSubmit = () => {
    setShowErrors(true);
    if (hasErrors) {
      toast({
        title: 'Check the form',
        description: 'Please fix the highlighted fields before saving',
        variant: 'destructive',
      });
      return;
    }
    onSave();
  };

  const setStock = (value: number) =>
    onProductChange({ ...product, stock_quantity: Math.max(0, value) });

  const stockBadge =
    stock <= 0
      ? { label: 'Out of stock', className: 'bg-red-50 text-red-600' }
      : stock <= LOW_STOCK_THRESHOLD
        ? { label: 'Low stock', className: 'bg-amber-50 text-amber-600' }
        : { label: 'In stock', className: 'bg-emerald-50 text-emerald-600' };

  const inputFocus = 'focus-visible:ring-[#7D2F38]/40';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4"
      onMouseDown={(e) => {
        backdropPressed.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Clicking anywhere outside the form closes it
        if (e.target === e.currentTarget && backdropPressed.current) {
          requestClose();
        }
        backdropPressed.current = false;
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit product' : 'Create product'}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#7D2F38] to-[#5A1F27] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              {isEditing ? <Pencil className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                {isEditing ? 'Edit Product' : 'Create Product'}
              </h2>
              <p className="text-sm text-white/70">
                {isEditing ? 'Update product details' : 'Add a new product to your inventory'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_280px]">
            {/* Form */}
            <div className="space-y-5">
              <Section title="Photos" description="The first photo is used as the main product image.">
                <ImageUpload
                  images={images}
                  onImagesChange={onImagesChange}
                  maxImages={5}
                  maxSizePerImageMB={2}
                />
              </Section>

              <Section title="Basic info">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={product.name}
                    autoFocus={!isEditing}
                    placeholder="e.g. Smoked Pork Pickle"
                    onChange={(e) => onProductChange({ ...product, name: e.target.value })}
                    className={`${inputFocus} ${showErrors && errors.name ? 'border-red-400' : ''}`}
                  />
                  {showErrors && <FieldError message={errors.name} />}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-gray-400">{(product.description || '').length} characters</span>
                  </div>
                  <Textarea
                    id="description"
                    rows={4}
                    value={product.description || ''}
                    placeholder="Tell customers what makes this product special..."
                    onChange={(e) => onProductChange({ ...product, description: e.target.value })}
                    className={inputFocus}
                  />
                </div>
              </Section>

              <Section title="Pricing & stock">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        value={Number.isNaN(price) ? '' : price}
                        onChange={(e) => onProductChange({ ...product, price: parseFloat(e.target.value) })}
                        className={`pl-7 ${inputFocus} ${showErrors && errors.price ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {showErrors && <FieldError message={errors.price} />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="offer_price">Offer Price</Label>
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 animate-in fade-in zoom-in-95 duration-150">
                          {discountPercent}% off
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
                      <Input
                        id="offer_price"
                        type="number"
                        min={0}
                        value={product.offer_price || ''}
                        onChange={(e) => onProductChange({ ...product, offer_price: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="Optional"
                        className={`pl-7 ${inputFocus} ${errors.offer_price ? 'border-red-400' : ''}`}
                      />
                    </div>
                    <FieldError message={errors.offer_price} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stockBadge.className}`}>
                      {stockBadge.label}
                    </span>
                  </div>
                  <div className="flex w-full max-w-[220px] items-center overflow-hidden rounded-lg border bg-white">
                    <button
                      type="button"
                      onClick={() => setStock(stock - 1)}
                      disabled={stock <= 0}
                      aria-label="Decrease stock"
                      className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      id="stock_quantity"
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="h-10 w-full border-x text-center text-sm font-medium outline-none focus:bg-[#7D2F38]/5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStock(stock + 1)}
                      aria-label="Increase stock"
                      className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Section>

              <Section title="Category" description="Pick a category, or add a new one with its own photo.">
                {loadingCategories ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((category) => {
                      const selected = product.category === category.slug;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => onProductChange({ ...product, category: category.slug as any })}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all active:scale-[0.98] ${
                            selected
                              ? 'border-[#7D2F38] bg-[#7D2F38]/5 ring-1 ring-[#7D2F38]'
                              : 'border-gray-200 bg-white hover:border-[#7D2F38]/50 hover:shadow-sm'
                          }`}
                        >
                          {category.image_url ? (
                            <img src={category.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                              <Tag className="h-4 w-4" />
                            </div>
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                            {category.name}
                          </span>
                          {selected && <Check className="h-4 w-4 shrink-0 text-[#7D2F38]" />}
                        </button>
                      );
                    })}

                    {/* Product already has a category that isn't in the table (e.g. older data) */}
                    {legacyCategory && (
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-xl border border-[#7D2F38] bg-[#7D2F38]/5 p-2 text-left ring-1 ring-[#7D2F38]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <Tag className="h-4 w-4" />
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize text-gray-800">
                          {legacyCategory.replace(/_/g, ' ')}
                        </span>
                        <Check className="h-4 w-4 shrink-0 text-[#7D2F38]" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={openCreatePanel}
                      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-2 text-sm font-medium text-gray-600 transition-all hover:border-[#7D2F38] hover:bg-[#7D2F38]/5 hover:text-[#7D2F38] active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      Add category
                    </button>
                  </div>
                )}

                {selectedCategory && !showCategoryPanel && (
                  <button
                    type="button"
                    onClick={openEditPanel}
                    className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-[#7D2F38]"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit "{selectedCategory.name}" name &amp; photo
                  </button>
                )}

                {/* Add / edit category */}
                {showCategoryPanel && (
                  <div className="space-y-4 rounded-xl border border-[#7D2F38]/30 bg-[#7D2F38]/5 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {editingCategory ? `Edit category: ${editingCategory.name}` : 'Add new category'}
                      </h4>
                      <button
                        type="button"
                        onClick={closeCategoryPanel}
                        aria-label="Close category panel"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_name">Category name</Label>
                      <Input
                        id="category_name"
                        value={categoryName}
                        autoFocus
                        onChange={(e) => setCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveCategory();
                          }
                        }}
                        placeholder="e.g. Pickles"
                        className={`bg-white ${inputFocus}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category photo</Label>

                      {/* Live preview of the category photo */}
                      <div className="flex items-center gap-4 rounded-xl border border-[#7D2F38]/20 bg-white p-3">
                        <div className="relative h-24 w-24 shrink-0">
                          {categoryImages[0] ? (
                            <>
                              <img
                                src={categoryImages[0]}
                                alt={categoryName.trim() || 'Category photo'}
                                className="h-24 w-24 rounded-xl object-cover shadow-sm animate-in fade-in zoom-in-95 duration-200"
                              />
                              <button
                                type="button"
                                onClick={() => setCategoryImages([])}
                                aria-label="Remove category photo"
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white shadow transition-colors hover:bg-red-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                              <ImageIcon className="h-7 w-7" />
                              <span className="text-[11px]">No photo</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Preview</p>
                          <p className="truncate font-semibold text-gray-900">
                            {categoryName.trim() || 'Category name'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {categoryImages[0]
                              ? 'This photo is shown next to the category.'
                              : 'Upload a photo below to see it here.'}
                          </p>
                        </div>
                      </div>

                      <ImageUpload
                        images={categoryImages}
                        onImagesChange={setCategoryImages}
                        maxImages={1}
                        maxSizePerImageMB={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleSaveCategory}
                        disabled={savingCategory}
                        className="bg-[#7D2F38] text-white hover:bg-[#5A1F27]"
                      >
                        {savingCategory ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {savingCategory ? 'Saving...' : editingCategory ? 'Update category' : 'Add category'}
                      </Button>
                      <Button type="button" variant="outline" onClick={closeCategoryPanel} disabled={savingCategory}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Section>

              <Section title="Visibility">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleCard
                    id="featured"
                    icon={Star}
                    title="Featured product"
                    description="Highlight it on the shop"
                    checked={product.featured || false}
                    onChange={(checked) => onProductChange({ ...product, featured: checked })}
                  />
                  <ToggleCard
                    id="is_active"
                    icon={Eye}
                    title="Active product"
                    description="Visible to customers"
                    checked={product.is_active || false}
                    onChange={(checked) => onProductChange({ ...product, is_active: checked })}
                  />
                </div>
              </Section>
            </div>

            {/* Live preview */}
            <aside className="hidden lg:block">
              <div className="sticky top-0 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Live preview</p>
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="relative aspect-square bg-gray-100">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-xs">No photo yet</span>
                      </div>
                    )}

                    <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                      {product.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-white shadow">
                          <Star className="h-3 w-3" /> Featured
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white shadow">
                          Inactive
                        </span>
                      )}
                      {stock <= 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {discountPercent > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-[#7D2F38] px-2 py-0.5 text-xs font-semibold text-white shadow">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 p-3">
                    <div className="flex items-center gap-1.5">
                      {selectedCategory?.image_url && (
                        <img
                          src={selectedCategory.image_url}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      <p className="text-xs font-medium uppercase tracking-wide capitalize text-gray-500">
                        {categoryLabel || 'No category'}
                      </p>
                    </div>
                    <h4 className="line-clamp-2 font-semibold text-gray-900">
                      {product.name?.trim() || 'Product name'}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#7D2F38]">
                        ₹{hasOffer && discountPercent > 0 ? offerPrice : Number.isNaN(price) ? 0 : price}
                      </span>
                      {hasOffer && discountPercent > 0 && (
                        <span className="text-sm text-gray-400 line-through">₹{price}</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">This is roughly how it will look to customers.</p>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Fields marked <span className="text-red-500">*</span> are required
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={requestClose} disabled={saving} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-[#7D2F38] text-white shadow-sm transition-all hover:bg-[#5A1F27] hover:shadow-md active:scale-95 sm:flex-none"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;