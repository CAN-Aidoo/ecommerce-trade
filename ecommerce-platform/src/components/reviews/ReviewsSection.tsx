import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Verified,
  MessageSquare
} from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { ReviewItem } from './ReviewItem';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import type { Review, Product } from '@/types';

interface ReviewsSectionProps {
  product: Product;
  reviews: Review[];
  onSubmitReview?: (review: Partial<Review>) => void;
  onHelpfulVote?: (reviewId: string, helpful: boolean) => void;
}

// Mock data for demonstration
const MOCK_REVIEWS: Review[] = [
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
    user: {
      id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'D.',
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
    productId: '1',
    userId: 'user2',
    rating: 4,
    title: 'Great value for money',
    comment: 'Good sound quality for the price. Battery life could be better but overall satisfied with the purchase.',
    isVerified: true,
    isApproved: true,
    helpfulCount: 12,
    user: {
      id: 'user2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'S.',
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
    productId: '1',
    userId: 'user3',
    rating: 3,
    title: 'Decent but not perfect',
    comment: 'The headphones are okay but I expected better build quality for this price range. Sound is good though.',
    isVerified: false,
    isApproved: true,
    helpfulCount: 5,
    user: {
      id: 'user3',
      email: 'mike@example.com',
      firstName: 'Mike',
      lastName: 'J.',
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

export function ReviewsSection({ 
  product, 
  reviews: initialReviews = [],
  onSubmitReview,
  onHelpfulVote 
}: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>(initialReviews.length > 0 ? initialReviews : MOCK_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  // Calculate review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Sort and filter reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterBy === 'all') return true;
      return review.rating === parseInt(filterBy);
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
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });

  const displayedReviews = showAllReviews ? filteredAndSortedReviews : filteredAndSortedReviews.slice(0, 3);

  const handleSubmitReview = (reviewData: Partial<Review>) => {
    const newReview: Review = {
      id: `rev${Date.now()}`,
      productId: product.id,
      userId: user?.id || 'anonymous',
      rating: reviewData.rating || 5,
      title: reviewData.title || '',
      comment: reviewData.comment || '',
      isVerified: true, // Would check if user actually purchased the product
      isApproved: true,
      helpfulCount: 0,
      user: user || {
        id: 'anonymous',
        email: 'anonymous@example.com',
        firstName: 'Anonymous',
        lastName: 'User',
        role: 'buyer',
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    onSubmitReview?.(newReview);
  };

  const handleHelpfulVote = (reviewId: string, helpful: boolean) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpfulCount: helpful ? review.helpfulCount + 1 : review.helpfulCount - 1 }
        : review
    ));
    onHelpfulVote?.(reviewId, helpful);
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <Progress 
                    value={totalReviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100 : 0} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="mt-6 pt-6 border-t">
            {isAuthenticated ? (
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Sign in to write a review</p>
                <Button variant="outline" asChild>
                  <a href="/auth/login">Sign In</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              onSubmit={handleSubmitReview}
              onCancel={() => setShowReviewForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reviews ({filteredAndSortedReviews.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filter by Rating */}
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>

              {/* Sort Options */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
                <option value="helpful">Most helpful</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">
                Be the first to review this product
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedReviews.map((review, index) => (
                <div key={review.id}>
                  <ReviewItem 
                    review={review} 
                    onHelpfulVote={handleHelpfulVote}
                  />
                  {index < displayedReviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}

              {/* Show More/Less Button */}
              {filteredAndSortedReviews.length > 3 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show All {filteredAndSortedReviews.length} Reviews
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}