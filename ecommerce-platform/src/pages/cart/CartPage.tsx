import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Tag,
  Percent
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/utils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import BreadcrumbNav from '@/components/ui/breadcrumb-nav';
import type { Product } from '@/types';

interface CouponFormData {
  code: string;
}

export function CartPage() {
  const navigate = useNavigate();
  const { items, isLoading, updateQuantity, removeItem, getTotalAmount, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const subtotal = getTotalAmount();
  const shipping = subtotal > 75 ? 0 : 9.99; // Free shipping over $75
  const tax = subtotal * 0.08; // 8% tax
  const discount = couponDiscount;
  const total = subtotal + shipping + tax - discount;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    
    // Mock coupon validation
    const validCoupons = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'WELCOME20': { discount: 20, type: 'percentage' },
      'SHIP5': { discount: 5, type: 'fixed' }
    };

    const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
    
    if (coupon) {
      if (appliedCoupon === couponCode.toUpperCase()) {
        setCouponError('This coupon is already applied');
        return;
      }
      
      const discountAmount = coupon.type === 'percentage' 
        ? (subtotal * coupon.discount) / 100
        : coupon.discount;
      
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponDiscount(discountAmount);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: { pathname: '/checkout' } }
      });
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shopping Cart', href: '#' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading cart..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet. 
                Start shopping to fill it up!
              </p>
              <Button onClick={handleContinueShopping} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={`${item.productId}-${item.isWholesale}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.images?.[0]?.imageUrl || '/images/electronics-category.jpg'}
                          alt={item.product?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              <Link 
                                to={`/product/${item.productId}`}
                                className="hover:text-blue-600"
                              >
                                {item.product?.name || 'Product Name'}
                              </Link>
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              {item.isWholesale && (
                                <Badge variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  Wholesale
                                </Badge>
                              )}
                              {(item.product?.stockQuantity || 0) < 10 && (
                                <Badge variant="destructive" className="text-xs">
                                  Low Stock
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Price */}
                              <div className="flex flex-col">
                                <span className="text-lg font-bold text-blue-600">
                                  {formatCurrency(item.unitPrice || 0)}
                                </span>
                                {item.isWholesale && item.product?.basePrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatCurrency(item.product.basePrice)}
                                  </span>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${item.productId}`} className="sr-only">
                                  Quantity
                                </Label>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  id={`quantity-${item.productId}`}
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => 
                                    handleQuantityChange(item.productId, parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 text-center h-8"
                                  min="1"
                                  max={item.product?.stockQuantity || 999}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  disabled={item.quantity >= (item.product?.stockQuantity || 0)}
                                  className="h-8 w-8"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Total for this item */}
                              <div className="text-right">
                                <span className="text-lg font-semibold">
                                  {formatCurrency(item.totalPrice || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Wholesale Notice */}
                        {item.isWholesale && (
                          <Alert className="mt-3">
                            <Package className="h-4 w-4" />
                            <AlertDescription>
                              Wholesale pricing applied. Minimum quantity: {item.product?.minWholesaleQuantity}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping */}
              <div className="pt-4">
                <Button variant="outline" onClick={handleContinueShopping}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || !!appliedCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm text-green-700">
                          <Percent className="w-3 h-3 inline mr-1" />
                          {appliedCoupon} applied
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-green-700 hover:text-green-800 h-auto p-0"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        Shipping
                        {shipping === 0 && (
                          <Badge variant="secondary" className="text-xs ml-1">Free</Badge>
                        )}
                      </span>
                      <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  </Button>

                  {/* Benefits */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Free shipping over $75</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-purple-500" />
                      <span>Easy returns within 30 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}