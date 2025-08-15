import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  Package,
  Truck,
  Mail,
  Download,
  Calendar,
  MapPin,
  CreditCard,
  Share2,
  Phone,
  ArrowLeft,
  Home,
  ShoppingBag,
  Star
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Order, OrderItem } from '@/types';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order data
      const mockOrder: Order = {
        id: orderId || 'ORD-123456',
        buyerId: user?.id || 'user1',
        orderNumber: orderId || 'ORD-123456',
        status: 'pending',
        paymentStatus: 'paid',
        totalAmount: 249.97,
        shippingAmount: 9.99,
        taxAmount: 19.99,
        discountAmount: 0,
        billingAddress: {
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          stateProvince: 'NY',
          postalCode: '10001',
          country: 'US',
          phone: '+1 (555) 123-4567'
        },
        shippingAddress: {
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          stateProvince: 'NY',
          postalCode: '10001',
          country: 'US',
          phone: '+1 (555) 123-4567'
        },
        paymentMethod: 'Credit Card',
        paymentReference: 'ch_1234567890',
        trackingNumber: undefined,
        notes: undefined,
        items: [
          {
            id: 'item1',
            orderId: orderId || 'ORD-123456',
            productId: '1',
            sellerId: 'seller1',
            quantity: 1,
            unitPrice: 199.99,
            totalPrice: 199.99,
            isWholesale: false,
            product: {
              id: '1',
              sellerId: 'seller1',
              categoryId: 'cat1',
              name: 'Premium Wireless Headphones',
              slug: 'premium-wireless-headphones',
              description: 'High-quality noise-cancelling headphones',
              sku: 'AM-WH-001',
              basePrice: 199.99,
              minWholesaleQuantity: 10,
              stockQuantity: 150,
              status: 'active',
              isFeatured: true,
              images: [
                {
                  id: 'img1',
                  productId: '1',
                  imageUrl: '/images/electronics-category.jpg',
                  altText: 'Wireless Headphones',
                  sortOrder: 1,
                  isPrimary: true,
                  createdAt: new Date()
                }
              ],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            createdAt: new Date()
          },
          {
            id: 'item2',
            orderId: orderId || 'ORD-123456',
            productId: '6',
            sellerId: 'seller1',
            quantity: 1,
            unitPrice: 39.99,
            totalPrice: 39.99,
            isWholesale: false,
            product: {
              id: '6',
              sellerId: 'seller1',
              categoryId: 'cat1',
              name: 'Wireless Charging Pad',
              slug: 'wireless-charging-pad',
              description: 'Fast wireless charging pad',
              sku: 'CF-WC-006',
              basePrice: 39.99,
              minWholesaleQuantity: 25,
              stockQuantity: 300,
              status: 'active',
              isFeatured: true,
              images: [
                {
                  id: 'img6',
                  productId: '6',
                  imageUrl: '/images/electronics-category.jpg',
                  altText: 'Wireless Charging Pad',
                  sortOrder: 1,
                  isPrimary: true,
                  createdAt: new Date()
                }
              ],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            createdAt: new Date()
          }
        ],
        buyer: user || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setOrder(mockOrder);
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId, user, isAuthenticated, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // Mock download
    alert('Invoice download started...');
  };

  const handleTrackOrder = () => {
    navigate(`/orders/${orderId}`);
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Order Number: <strong>{order.orderNumber}</strong></span>
            <span>•</span>
            <span>Placed on {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-3 mb-8">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            Print Order
          </Button>
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
          <Button onClick={handleTrackOrder}>
            <Package className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product?.images?.[0]?.imageUrl || '/images/electronics-category.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          <Link 
                            to={`/product/${item.productId}`}
                            className="hover:text-blue-600"
                          >
                            {item.product?.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {item.product?.sku}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          {item.isWholesale && (
                            <Badge variant="secondary" className="text-xs">Wholesale</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.totalPrice)}</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(item.unitPrice)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Billing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                      <Phone className="w-3 h-3" />
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600">
                      Transaction ID: {order.paymentReference}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge 
                        variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Standard Shipping</p>
                      <p className="text-sm text-blue-700">5-7 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-900">
                        {order.shippingAmount === 0 ? 'Free' : formatCurrency(order.shippingAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(getEstimatedDelivery())}
                      </p>
                    </div>
                  </div>

                  {order.trackingNumber ? (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Tracking Number</p>
                        <p className="text-sm text-blue-600 font-mono">
                          {order.trackingNumber}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <Package className="h-4 w-4" />
                      <AlertDescription>
                        Tracking information will be provided once your order ships.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Next Steps */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.totalAmount - order.shippingAmount - order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shippingAmount === 0 ? 'Free' : formatCurrency(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-gray-600">
                        You'll receive an email confirmation shortly
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-gray-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-gray-600">
                        We'll prepare your items for shipment
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-gray-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Shipping</p>
                      <p className="text-sm text-gray-600">
                        Track your package with the provided tracking number
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                    <Package className="w-4 h-4 mr-2" />
                    View All Orders
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                    <Home className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  If you have any questions about your order, our support team is here to help.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call: 1-800-SHOP-NOW
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review Prompt */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">Love your purchase?</h3>
                  <p className="text-sm text-gray-600">
                    Share your experience with other customers
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Write a Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}