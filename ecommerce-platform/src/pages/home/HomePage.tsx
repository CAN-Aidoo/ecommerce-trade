import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Users, 
  TrendingUp, 
  Package,
  Star,
  ArrowRight,
  Search,
  Filter,
  ChevronRight,
  Store,
  Globe,
  Zap
} from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/api";
import LoadingSpinner from "@/components/ui/loading-spinner";

export function HomePage() {
  const { data: featuredProducts, isLoading: loadingProducts } = useProducts({
    featured: true,
    limit: 8
  });

  const categories = [
    {
      name: "Electronics",
      description: "Latest gadgets & tech",
      image: "/images/electronics-category.jpg",
      itemCount: "12,450+ items",
      color: "bg-blue-500"
    },
    {
      name: "Fashion",
      description: "Clothing & accessories",
      image: "/images/fashion-category.jpg",
      itemCount: "8,920+ items",
      color: "bg-pink-500"
    },
    {
      name: "Home & Furniture",
      description: "Decor & living essentials",
      image: "/images/furniture-category.jpg",
      itemCount: "5,680+ items",
      color: "bg-green-500"
    },
    {
      name: "Wholesale",
      description: "Bulk orders & B2B",
      image: "/images/bulk-buying.png",
      itemCount: "2,340+ suppliers",
      color: "bg-orange-500"
    }
  ];

  const features = [
    {
      icon: Package,
      title: "Wholesale Pricing",
      description: "Get better prices on bulk orders from verified suppliers"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "100% secure transactions with buyer protection"
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery worldwide with tracking"
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Expert support team ready to help you"
    }
  ];

  const stats = [
    { value: "50K+", label: "Products" },
    { value: "10K+", label: "Suppliers" },
    { value: "99%", label: "Satisfaction" },
    { value: "150+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-transparent" />
          <img 
            src="/images/wholesale-hero.jpg" 
            alt="Wholesale marketplace" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Zap className="w-3 h-3 mr-1" />
                New Platform
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Global
              <span className="block text-yellow-300">Marketplace</span>
              for Everything
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
              Connect with suppliers worldwide. Buy retail or wholesale. 
              Get the best deals from verified merchants.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Start Shopping
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                Become a Seller
                <Store className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Search for products, categories, or suppliers..."
                    className="pl-12 pr-4 h-14 text-lg bg-white/95 backdrop-blur border-0 focus:bg-white"
                  />
                </div>
                <Button size="lg" className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover millions of products across all categories with competitive pricing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-xl mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-200">{category.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.itemCount}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked products from our trusted suppliers
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-200 rounded mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts || []} />
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need for successful online commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready for Wholesale?
              </h2>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Unlock better prices, bulk discounts, and exclusive supplier relationships. 
                Perfect for retailers, resellers, and businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold">
                  Start Wholesale
                  <TrendingUp className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/bulk-buying.png" 
                alt="Bulk buying benefits"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get the latest deals, new product alerts, and exclusive offers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email address"
              className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>
    </div>
  );
}