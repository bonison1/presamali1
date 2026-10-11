
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { useCart } from '@/hooks/useCartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import Layout from '@/components/Layout';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import { Product as ProductType } from '@/types/product';

const Product = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [allImages, setAllImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return;
      }

      setProduct(data);
      
      // Set up images
      const images = [];
      if (data.image_url) images.push(data.image_url);
      if (data.image_urls) images.push(...data.image_urls);
      
      setAllImages(images);
      setSelectedImage(images[0] || '');
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
  if (!isAuthenticated) {
    toast({
      title: "Please sign in",
      description: "You need to be signed in to add items to cart",
      variant: "destructive",
    });
    return;
  }

  if (!product) return;

  try {
    await addToCart(product.id, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.name} added to your cart`,
    });
  } catch (error) {
    console.error('Add to cart failed:', error);
  }
};

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchProduct();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/shop">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const displayPrice = product.offer_price || product.price;
  const hasOffer = product.offer_price && product.offer_price < product.price;
  const isInStock = (product.stock_quantity || 0) > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage || '/placeholder-image.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === image ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Badge variant="outline" className="mb-4">
                  {product.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
              
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ₹{displayPrice}
                </span>
                {hasOffer && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                    <Badge className="bg-red-500">
                      {Math.round(((product.price - product.offer_price!) / product.price) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Stock:</span>
                <Badge variant={isInStock ? "default" : "destructive"}>
                  {isInStock ? `${product.stock_quantity} available` : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {product.ingredients && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <p className="text-gray-700">{product.ingredients}</p>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {isInStock && isAuthenticated && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <label htmlFor="quantity" className="font-medium">Quantity:</label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border rounded px-3 py-1"
                    >
                      {[...Array(Math.min(10, product.stock_quantity || 1))].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ₹{displayPrice * quantity}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">Please sign in to purchase this product</p>
                  <Link to="/auth">
                    <Button>Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          
          {user && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          )}
          
          <ReviewsList productId={product.id} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </Layout>
  );
};

export default Product;
