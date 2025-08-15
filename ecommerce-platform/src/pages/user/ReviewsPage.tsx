import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Star,
  Calendar,
  Package,
  Edit,
  Trash2,
  MessageSquare,
  Award
} from 'lucide-react';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Review } from '@/types';

// Mock user reviews data
const MOCK_USER_REVIEWS: Review[] = [
  {
    id: 'rev1',
    productId: '1',
    userId: 'user1',
    rating: 5,
    title: 'Excellent headphones!',
    comment: 'Amazing sound quality and comfort. The noise cancellation works perfectly. Highly recommended for anyone looking for premium headphones.',
    isVerified: true,
    isApproved: true,
    helpfulCount: 24,
    product: {
      id: '1',
      sellerId: 'seller1',
      categoryId: 'electronics',
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'High-quality noise-cancelling headphones',
      sku: 'AWH-001',
      basePrice: 199.99,
      minWholesaleQuantity: 10,
      stockQuantity: 25,
      status: 'active',
      isFeatured: true,
      images: [{
        id: 'img1',
        productId: '1',
        imageUrl: '/images/electronics-category.jpg',
        altText: 'Premium Wireless Headphones',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    user: {
      id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'rev2',
    productId: '2',
    userId: 'user1',
    rating: 4,
    title: 'Good fitness tracker',
    comment: 'Good fitness tracking features and battery life. The heart rate monitor is accurate. Could use better water resistance though.',
    isVerified: true,
    isApproved: true,
    helpfulCount: 8,
    product: {
      id: '2',
      sellerId: 'seller1',
      categoryId: 'electronics',
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      description: 'Advanced fitness tracking watch',
      sku: 'SFW-002',
      basePrice: 299.99,
      minWholesaleQuantity: 5,
      stockQuantity: 8,
      status: 'active',
      isFeatured: false,
      images: [{
        id: 'img2',
        productId: '2',
        imageUrl: '/images/electronics-category.jpg',
        altText: 'Smart Fitness Watch',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    user: {
      id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'rev3',
    productId: '3',
    userId: 'user1',
    rating: 3,
    title: 'Average charging pad',
    comment: 'Does the job but charges slowly. Had some issues with overheating. Decent for the price but there are better options.',
    isVerified: true,
    isApproved: true,
    helpfulCount: 2,
    product: {
      id: '3',
      sellerId: 'seller1',
      categoryId: 'electronics',
      name: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      description: 'Fast wireless charging pad',
      sku: 'WCP-003',
      basePrice: 39.99,
      minWholesaleQuantity: 20,
      stockQuantity: 0,
      status: 'out_of_stock',
      isFeatured: false,
      images: [{
        id: 'img3',
        productId: '3',
        imageUrl: '/images/electronics-category.jpg',
        altText: 'Wireless Charging Pad',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    user: {
      id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

export function UserReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setReviews(MOCK_USER_REVIEWS);
      setIsLoading(false);
    };

    if (user) {
      fetchReviews();
    }
  }, [user]);

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          review.product?.name.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(review => {
      // Rating filter
      if (ratingFilter === 'all') return true;
      return review.rating === parseInt(ratingFilter);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  const totalHelpfulVotes = reviews.reduce((sum, review) => sum + review.helpfulCount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your reviews..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">
            Manage and track your product reviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </p>
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
                  <p className="text-3xl font-bold text-gray-900">{totalHelpfulVotes}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as typeof ratingFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || ratingFilter !== 'all' 
                    ? 'No reviews match your filters' 
                    : 'No reviews yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || ratingFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start reviewing products you\'ve purchased to help other customers'
                  }
                </p>
                {!searchQuery && ratingFilter === 'all' && (
                  <Button asChild>
                    <Link to="/">
                      Browse Products
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <ReviewItem 
                    review={review} 
                    showProductInfo={true}
                  />
                  
                  {/* Review Management Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Reviewed on {formatDate(review.createdAt)}</span>
                      {review.updatedAt > review.createdAt && (
                        <span>• Updated {formatDate(review.updatedAt)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Review Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Do:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Share your honest experience with the product</li>
                  <li>• Focus on product features and quality</li>
                  <li>• Include specific details that help other buyers</li>
                  <li>• Update your review if your opinion changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Don't:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Include personal information or contact details</li>
                  <li>• Write reviews for products you haven't used</li>
                  <li>• Use inappropriate language or content</li>
                  <li>• Focus on shipping or customer service issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}