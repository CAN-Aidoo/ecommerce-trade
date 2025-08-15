import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Bell,
  ChevronDown,
  Package,
  Settings,
  LogOut,
  Store
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAuthStore, useUser, useIsAuthenticated } from '@/store/auth';
import { useCartTotalItems } from '@/store/cart';
import { useWishlistTotalItems } from '@/store/wishlist';
import { cn } from '@/utils';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const cartItemsCount = useCartTotalItems();
  const wishlistItemsCount = useWishlistTotalItems();
  const { logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
    { href: '/wholesale', label: 'Wholesale' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      {/* Top bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-muted-foreground">Free shipping on orders over $75</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/help" className="text-muted-foreground hover:text-foreground">
                Help
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                  <Link to="/auth/register" className="text-muted-foreground hover:text-foreground">
                    Sign Up
                  </Link>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Welcome, {user?.firstName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-lg font-medium hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <>
                      <hr className="my-4" />
                      <Link
                        to="/dashboard"
                        className="text-lg font-medium hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      {user?.role === 'seller' && (
                        <Link
                          to="/seller"
                          className="text-lg font-medium hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Seller Center
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        className="text-lg font-medium hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="text-lg font-medium hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:block">
                MarketPlace
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        3
                      </Badge>
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">Order shipped</span>
                        <span className="text-sm text-muted-foreground">
                          Your order #2024-000001 has been shipped
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">New review</span>
                        <span className="text-sm text-muted-foreground">
                          You received a 5-star review
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center">
                      <Link to="/notifications" className="text-sm text-primary">
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wishlist */}
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlistItemsCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {wishlistItemsCount}
                      </Badge>
                    )}
                    <span className="sr-only">Wishlist</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Shopping cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
                <span className="sr-only">Shopping cart</span>
              </Link>
            </Button>

            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'seller' && (
                    <DropdownMenuItem asChild>
                      <Link to="/seller">
                        <Store className="mr-2 h-4 w-4" />
                        <span>Seller Center</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/auth/login">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}