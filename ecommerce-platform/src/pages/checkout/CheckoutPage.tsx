import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Package,
  Calendar,
  Building
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, isValidEmail, isValidPhone } from '@/utils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import BreadcrumbNav from '@/components/ui/breadcrumb-nav';
import type { Address } from '@/types';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  billingAddressSame: boolean;
  billingAddress: ShippingFormData;
}

interface CheckoutErrors {
  shipping?: Partial<ShippingFormData>;
  payment?: Partial<PaymentFormData>;
  general?: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalAmount, getTotalItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    billingAddressSame: true,
    billingAddress: { ...shippingData }
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = getTotalAmount();
  const shippingCost = shippingMethod === 'express' ? 19.99 : subtotal > 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: { pathname: '/checkout' } }
      });
      return;
    }
    
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items.length, navigate]);

  const handleShippingChange = (field: keyof ShippingFormData, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
    // Clear errors
    if (errors.shipping?.[field]) {
      setErrors(prev => ({
        ...prev,
        shipping: { ...prev.shipping, [field]: undefined }
      }));
    }
  };

  const handlePaymentChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
    // Clear errors
    if (errors.payment?.[field as keyof Partial<PaymentFormData>]) {
      setErrors(prev => ({
        ...prev,
        payment: { ...prev.payment, [field]: undefined }
      }));
    }
  };

  const validateShipping = (): boolean => {
    const shippingErrors: Partial<ShippingFormData> = {};

    if (!shippingData.firstName.trim()) shippingErrors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) shippingErrors.lastName = 'Last name is required';
    if (!shippingData.email) {
      shippingErrors.email = 'Email is required';
    } else if (!isValidEmail(shippingData.email)) {
      shippingErrors.email = 'Invalid email address';
    }
    if (!shippingData.phone) {
      shippingErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(shippingData.phone)) {
      shippingErrors.phone = 'Invalid phone number';
    }
    if (!shippingData.address.trim()) shippingErrors.address = 'Address is required';
    if (!shippingData.city.trim()) shippingErrors.city = 'City is required';
    if (!shippingData.state.trim()) shippingErrors.state = 'State is required';
    if (!shippingData.postalCode.trim()) shippingErrors.postalCode = 'Postal code is required';

    setErrors(prev => ({ ...prev, shipping: shippingErrors }));
    return Object.keys(shippingErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const paymentErrors: Partial<PaymentFormData> = {};

    if (!paymentData.cardNumber.replace(/\s/g, '')) {
      paymentErrors.cardNumber = 'Card number is required';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 15) {
      paymentErrors.cardNumber = 'Invalid card number';
    }
    if (!paymentData.expiryDate) paymentErrors.expiryDate = 'Expiry date is required';
    if (!paymentData.cvv) {
      paymentErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length < 3) {
      paymentErrors.cvv = 'Invalid CVV';
    }
    if (!paymentData.nameOnCard.trim()) paymentErrors.nameOnCard = 'Name on card is required';

    setErrors(prev => ({ ...prev, payment: paymentErrors }));
    return Object.keys(paymentErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (validateShipping()) {
        setCurrentStep('payment');
      }
    } else if (currentStep === 'payment') {
      if (validatePayment()) {
        setCurrentStep('review');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrors({});

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful order creation
      const orderId = `ORD-${Date.now()}`;
      
      // Clear cart
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '#' }
  ];

  const shippingOptions = [
    { 
      value: 'standard', 
      label: 'Standard Shipping', 
      description: '5-7 business days',
      price: subtotal > 75 ? 0 : 9.99
    },
    { 
      value: 'express', 
      label: 'Express Shipping', 
      description: '2-3 business days',
      price: 19.99
    }
  ];

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { key: 'shipping', label: 'Shipping', icon: MapPin },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'review', label: 'Review', icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = 
                (step.key === 'shipping' && ['payment', 'review'].includes(currentStep)) ||
                (step.key === 'payment' && currentStep === 'review');
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }
                  `}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={shippingData.firstName}
                          onChange={(e) => handleShippingChange('firstName', e.target.value)}
                          className={errors.shipping?.firstName ? 'border-red-500' : ''}
                        />
                        {errors.shipping?.firstName && (
                          <p className="text-sm text-red-600">{errors.shipping.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={shippingData.lastName}
                          onChange={(e) => handleShippingChange('lastName', e.target.value)}
                          className={errors.shipping?.lastName ? 'border-red-500' : ''}
                        />
                        {errors.shipping?.lastName && (
                          <p className="text-sm text-red-600">{errors.shipping.lastName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => handleShippingChange('email', e.target.value)}
                          className={errors.shipping?.email ? 'border-red-500' : ''}
                        />
                        {errors.shipping?.email && (
                          <p className="text-sm text-red-600">{errors.shipping.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingData.phone}
                          onChange={(e) => handleShippingChange('phone', e.target.value)}
                          className={errors.shipping?.phone ? 'border-red-500' : ''}
                        />
                        {errors.shipping?.phone && (
                          <p className="text-sm text-red-600">{errors.shipping.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={shippingData.address}
                          onChange={(e) => handleShippingChange('address', e.target.value)}
                          className={errors.shipping?.address ? 'border-red-500' : ''}
                        />
                        {errors.shipping?.address && (
                          <p className="text-sm text-red-600">{errors.shipping.address}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                        <Input
                          id="address2"
                          value={shippingData.address2}
                          onChange={(e) => handleShippingChange('address2', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingData.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            className={errors.shipping?.city ? 'border-red-500' : ''}
                          />
                          {errors.shipping?.city && (
                            <p className="text-sm text-red-600">{errors.shipping.city}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={shippingData.state}
                            onChange={(e) => handleShippingChange('state', e.target.value)}
                            className={errors.shipping?.state ? 'border-red-500' : ''}
                          />
                          {errors.shipping?.state && (
                            <p className="text-sm text-red-600">{errors.shipping.state}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">ZIP Code</Label>
                          <Input
                            id="postalCode"
                            value={shippingData.postalCode}
                            onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                            className={errors.shipping?.postalCode ? 'border-red-500' : ''}
                          />
                          {errors.shipping?.postalCode && (
                            <p className="text-sm text-red-600">{errors.shipping.postalCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Options */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Options</h3>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      {shippingOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div className="flex-1">
                            <Label htmlFor={option.value} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="font-medium cursor-pointer flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Card Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                          className={errors.payment?.cardNumber ? 'border-red-500' : ''}
                          maxLength={19}
                        />
                        {errors.payment?.cardNumber && (
                          <p className="text-sm text-red-600">{errors.payment.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={(e) => handlePaymentChange('expiryDate', formatExpiryDate(e.target.value))}
                            className={errors.payment?.expiryDate ? 'border-red-500' : ''}
                            maxLength={5}
                          />
                          {errors.payment?.expiryDate && (
                            <p className="text-sm text-red-600">{errors.payment.expiryDate}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                            className={errors.payment?.cvv ? 'border-red-500' : ''}
                            maxLength={4}
                          />
                          {errors.payment?.cvv && (
                            <p className="text-sm text-red-600">{errors.payment.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input
                          id="nameOnCard"
                          value={paymentData.nameOnCard}
                          onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
                          className={errors.payment?.nameOnCard ? 'border-red-500' : ''}
                        />
                        {errors.payment?.nameOnCard && (
                          <p className="text-sm text-red-600">{errors.payment.nameOnCard}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Address */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billingAddressSame"
                      checked={paymentData.billingAddressSame}
                      onCheckedChange={(checked) => handlePaymentChange('billingAddressSame', checked as boolean)}
                    />
                    <Label htmlFor="billingAddressSame">
                      Billing address is same as shipping address
                    </Label>
                  </div>

                  {/* Security Notice */}
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment information is encrypted and secure. We never store your card details.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {currentStep === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Review Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.isWholesale}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.product?.images?.[0]?.imageUrl || '/images/electronics-category.jpg'}
                            alt={item.product?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            {item.isWholesale && (
                              <Badge variant="secondary" className="text-xs">Wholesale</Badge>
                            )}
                          </div>
                          <span className="font-medium">{formatCurrency(item.totalPrice || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{shippingData.firstName} {shippingData.lastName}</p>
                      <p>{shippingData.address}</p>
                      {shippingData.address2 && <p>{shippingData.address2}</p>}
                      <p>{shippingData.city}, {shippingData.state} {shippingData.postalCode}</p>
                      <p className="text-sm text-gray-600 mt-1">{shippingData.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">•••• •••• •••• {paymentData.cardNumber.slice(-4)}</p>
                      <p className="text-sm text-gray-600">{paymentData.nameOnCard}</p>
                    </div>
                  </div>

                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={currentStep === 'shipping' ? () => navigate('/cart') : handlePreviousStep}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 'shipping' ? 'Back to Cart' : 'Previous'}
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order ({formatCurrency(total)})
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNextStep}>
                  Continue
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-purple-500" />
                    <span>Tracking information provided</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}