import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Store,
  CreditCard,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SOCIAL_LINKS, CONTACT_INFO } from '@/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { href: '/categories', label: 'All Categories' },
        { href: '/wholesale', label: 'Wholesale' },
        { href: '/deals', label: 'Special Deals' },
        { href: '/new-arrivals', label: 'New Arrivals' },
        { href: '/best-sellers', label: 'Best Sellers' },
        { href: '/gift-cards', label: 'Gift Cards' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/contact', label: 'Contact Us' },
        { href: '/shipping', label: 'Shipping Info' },
        { href: '/returns', label: 'Returns & Exchanges' },
        { href: '/size-guide', label: 'Size Guide' },
        { href: '/track-order', label: 'Track Your Order' },
      ],
    },
    {
      title: 'Sell',
      links: [
        { href: '/seller/register', label: 'Become a Seller' },
        { href: '/seller/center', label: 'Seller Center' },
        { href: '/seller/tools', label: 'Seller Tools' },
        { href: '/seller/support', label: 'Seller Support' },
        { href: '/wholesale/register', label: 'Wholesale Program' },
        { href: '/api-docs', label: 'API Documentation' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press' },
        { href: '/investors', label: 'Investors' },
        { href: '/sustainability', label: 'Sustainability' },
        { href: '/blog', label: 'Blog' },
      ],
    },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $75'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure checkout'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment',
      description: 'Various payment methods'
    },
  ];

  const paymentMethods = [
    'visa',
    'mastercard',
    'american-express',
    'paypal',
    'apple-pay',
    'google-pay'
  ];

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
  };

  return (
    <footer className="bg-muted/30 border-t">
      {/* Features section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive deals, new arrivals, and insider updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">MarketPlace</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your trusted marketplace for quality products from verified sellers worldwide. 
              Discover amazing deals and wholesale opportunities.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${CONTACT_INFO.EMAIL}`} className="hover:text-primary">
                  {CONTACT_INFO.EMAIL}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${CONTACT_INFO.PHONE}`} className="hover:text-primary">
                  {CONTACT_INFO.PHONE}
                </a>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{CONTACT_INFO.ADDRESS}</span>
              </div>
            </div>

            {/* Social media links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a 
                  href={SOCIAL_LINKS.FACEBOOK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a 
                  href={SOCIAL_LINKS.TWITTER} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a 
                  href={SOCIAL_LINKS.INSTAGRAM} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a 
                  href={SOCIAL_LINKS.LINKEDIN} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Legal links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
              <span>© {currentYear} MarketPlace. All rights reserved.</span>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-foreground">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="hover:text-foreground">
                Accessibility
              </Link>
            </div>

            {/* Payment methods */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground mr-2">We accept:</span>
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="h-8 w-12 bg-white rounded border flex items-center justify-center"
                  title={method.replace('-', ' ').toUpperCase()}
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}