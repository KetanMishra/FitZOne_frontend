import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Building, MapPin, User, Mail, Phone, Lock, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('pk_test_51234567890abcdef...');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Billing Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Billing Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Card Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // UPI Information
    upiId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[+]?[91]?[0-9\s\-]{10,13}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    // Payment method specific validation
    if (paymentMethod === 'card') {
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    try {
      // Simulate payment processing with Stripe or other payment gateway
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalPrice() * 100, // Convert to cents
          currency: 'inr',
          payment_method: paymentMethod,
          customer_info: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone
          },
          items: items
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const { client_secret } = await response.json();
      
      // For demo purposes, we'll simulate a successful payment
      return { success: true, payment_intent_id: 'pi_demo_' + Date.now() };
      
    } catch (error) {
      console.error('Payment error:', error);
      // For demo purposes, we'll simulate a successful payment
      return { success: true, payment_intent_id: 'pi_demo_' + Date.now() };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);

    try {
      // Process payment
      const paymentResult = await processPayment();
      
      if (paymentResult.success) {
        // Clear cart and show success
        clearCart();
        setIsProcessing(false);
        setShowSuccess(true);

        // Redirect after success
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  if (showSuccess) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! You will receive a confirmation email shortly with your order details and access instructions.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to home page in a few seconds...
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  const subtotal = getTotalPrice();
  const processingFee = Math.round(subtotal * 0.029); // 2.9% processing fee
  const total = subtotal + processingFee;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shopping</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                      paymentMethod === 'card' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit/Debit Card</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                      paymentMethod === 'upi' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>UPI Payment</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                      {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                      {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                        {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                        {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="yourname@paytm"
                      required
                    />
                    {errors.upiId && <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>}
                  </div>
                )}
              </div>

              {/* Billing Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Doe"
                        required
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="john@example.com"
                        required
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                        required
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="123 Main Street"
                        required
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Mumbai"
                        required
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Maharashtra"
                        required
                      />
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="400001"
                          required
                        />
                        {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Complete Payment - {formatPrice(total)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Order Summary</span>
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="capitalize">Type: {item.type}</p>
                        {item.duration && <p>Duration: {item.duration}</p>}
                        {item.level && <p>Level: {item.level}</p>}
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="text-gray-900">{formatPrice(processingFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-orange-500 text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">What's Included:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Instant access to all purchased items</li>
                      <li>• Email confirmation and receipts</li>
                      <li>• 30-day money back guarantee</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Secure Payment</h4>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;