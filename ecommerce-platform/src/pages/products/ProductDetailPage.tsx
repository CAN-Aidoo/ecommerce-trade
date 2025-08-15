import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  AlertCircle,
  User,
  Star as StarFilled,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import BreadcrumbNav from '@/components/ui/breadcrumb-nav';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/api';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatCurrency, formatDate } from '@/utils';
import type { Product, Review } from '@/types';

interface ProductDetailPageProps {
  productId?: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const finalProductId = productId || id || '1';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWholesale, setIsWholesale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: relatedProducts } = useProducts({ limit: 4 });
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlistStore();

  // Mock product data - in real app this would come from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProduct: Product = {
        id: finalProductId,
        sellerId: 'seller1',
        categoryId: 'cat1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'Experience superior sound quality with our premium wireless headphones featuring advanced noise cancellation technology. These headphones are perfect for both professional and personal use, offering crystal-clear audio and exceptional comfort for extended listening sessions.',
        shortDescription: 'Premium wireless headphones with noise cancellation',
        sku: 'AM-WH-001',
        basePrice: 199.99,
        wholesalePrice: 149.99,
        minWholesaleQuantity: 10,
        stockQuantity: 150,
        weight: 0.3,
        dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
        status: 'active',
        isFeatured: true,
        images: [
          {
            id: 'img1',
            productId: finalProductId,
            imageUrl: '/images/electronics-category.jpg',
            altText: 'Wireless Headphones - Main View',
            sortOrder: 1,
            isPrimary: true,
            createdAt: new Date()
          },
          {
            id: 'img2',
            productId: finalProductId,
            imageUrl: '/images/electronics-category.jpg',
            altText: 'Wireless Headphones - Side View',
            sortOrder: 2,
            isPrimary: false,
            createdAt: new Date()
          },
          {
            id: 'img3',
            productId: finalProductId,
            imageUrl: '/images/electronics-category.jpg',
            altText: 'Wireless Headphones - Detail View',
            sortOrder: 3,
            isPrimary: false,
            createdAt: new Date()
          }
        ],
        averageRating: 4.8,
        totalReviews: 234,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional fields for display
        category: {
          id: 'cat1',
          name: 'Electronics',
          slug: 'electronics',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        seller: {
          id: 'seller1',
          email: 'seller@techsolutions.com',
          firstName: 'Tech',
          lastName: 'Solutions Pro',
          role: 'seller' as const,
          emailVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      setProduct(mockProduct);
      setIsLoading(false);
    };

    fetchProduct();
  }, [finalProductId]);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: 'rev1',
      productId: finalProductId,
      userId: 'user1',
      orderItemId: 'orderitem1',
      rating: 5,
      title: 'Excellent sound quality!',
      comment: 'These headphones exceeded my expectations. The noise cancellation is amazing and the battery life is fantastic.',
      isVerified: true,
      isApproved: true,
      helpfulCount: 12,
      createdAt: new Date('2024-07-15'),
      updatedAt: new Date('2024-07-15'),
      user: {
        id: 'user1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'D.',
        role: 'buyer' as const,
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: 'rev2',
      productId: finalProductId,
      userId: 'user2',
      orderItemId: 'orderitem2',
      rating: 4,
      title: 'Great value for money',
      comment: 'Good headphones for the price. Comfortable to wear for long periods.',
      isVerified: true,
      isApproved: true,
      helpfulCount: 8,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-07-10'),
      user: {
        id: 'user2',
        email: 'user2@example.com',
        firstName: 'Sarah',
        lastName: 'M.',
        role: 'buyer' as const,
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ];

  const handleAddToCart = () => {
    if (!product) return;
    
    const isValidWholesale = !isWholesale || quantity >= product.minWholesaleQuantity;
    
    if (!isValidWholesale) {
      alert(`Minimum quantity for wholesale is ${product.minWholesaleQuantity}`);
      return;
    }

    addItem(product, quantity, isWholesale);
    
    // Show success message
    alert('Product added to cart!');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isItemInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const getDisplayPrice = () => {
    if (!product) return 0;
    return isWholesale && product.wholesalePrice ? product.wholesalePrice : product.basePrice;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarFilled
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <AlertCircle className="w-16 h-16 text-gray-400" />
        <h1 className="text-2xl font-semibold text-gray-900">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: product.category?.name || 'Category', href: `/category/${product.categoryId}` },
    { label: product.name, href: '#' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} className="mb-6" />
        
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.images[selectedImageIndex]?.imageUrl || '/images/electronics-category.jpg'}
                alt={product.images[selectedImageIndex]?.altText || product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(Math.min(product.images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === product.images.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category?.name}</Badge>
                {product.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(Math.floor(product.averageRating || 0))}
                </div>
                <span className="font-medium">{product.averageRating}</span>
                <span className="text-gray-500">({product.totalReviews} reviews)</span>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Price Toggle */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="wholesale-toggle" className="text-base font-medium">
                      Pricing Type:
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={!isWholesale ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsWholesale(false)}
                      >
                        Retail
                      </Button>
                      <Button
                        variant={isWholesale ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsWholesale(true)}
                        disabled={!product.wholesalePrice}
                      >
                        Wholesale
                      </Button>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {formatCurrency(getDisplayPrice())}
                      </span>
                      {isWholesale && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>
                    
                    {isWholesale && (
                      <p className="text-sm text-blue-600">
                        Minimum order: {product.minWholesaleQuantity} units
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                        min="1"
                        max={product.stockQuantity}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        ({product.stockQuantity} available)
                      </span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(getDisplayPrice() * quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full"
                      size="lg"
                      disabled={product.stockQuantity === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleWishlistToggle}
                        className="flex-1"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isItemInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
                        {isItemInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {product.stockQuantity > 0 ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">In Stock</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.totalReviews})</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>{product.description}</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Quality Guaranteed</h4>
                      <p className="text-sm text-gray-600">Premium materials and construction</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Fast Shipping</h4>
                      <p className="text-sm text-gray-600">Free delivery on orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Warranty</h4>
                      <p className="text-sm text-gray-600">2-year manufacturer warranty</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="font-medium text-gray-900">SKU</dt>
                    <dd className="text-gray-600">{product.sku}</dd>
                  </div>
                  {product.weight && (
                    <div>
                      <dt className="font-medium text-gray-900">Weight</dt>
                      <dd className="text-gray-600">{product.weight} kg</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <dt className="font-medium text-gray-900">Dimensions</dt>
                      <dd className="text-gray-600">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-gray-900">Status</dt>
                    <dd>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user?.firstName} {review.user?.lastName}</span>
                          {review.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}
                        {review.comment && <p className="text-gray-600 mb-2">{review.comment}</p>}
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Helpful ({review.helpfulCount})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seller" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {product.seller?.firstName} {product.seller?.lastName}
                    </h3>
                    <p className="text-gray-600 mb-4">Professional electronics supplier</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Member Since:</span>
                        <p className="text-gray-600">{product.seller?.createdAt ? formatDate(product.seller.createdAt) : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Response Time:</span>
                        <p className="text-gray-600">Within 2 hours</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4">
                      Contact Seller
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}