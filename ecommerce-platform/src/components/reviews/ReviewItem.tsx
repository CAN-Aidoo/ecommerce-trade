import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  User,
  Calendar,
  Verified,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import type { Review } from '@/types';

interface ReviewItemProps {
  review: Review;
  onHelpfulVote?: (reviewId: string, helpful: boolean) => void;
  onReport?: (reviewId: string) => void;
  showProductInfo?: boolean;
}

export function ReviewItem({ 
  review, 
  onHelpfulVote, 
  onReport,
  showProductInfo = false 
}: ReviewItemProps) {
  const { user } = useAuthStore();
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'not-helpful' | null>(null);

  const handleHelpfulVote = (helpful: boolean) => {
    if (hasVoted) return;
    
    setHasVoted(true);
    setUserVote(helpful ? 'helpful' : 'not-helpful');
    onHelpfulVote?.(review.id, helpful);
  };

  const handleReport = () => {
    onReport?.(review.id);
    alert('Review reported. Thank you for helping us maintain quality.');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatUserName = (firstName: string, lastName: string) => {
    // Show first name and last initial for privacy
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  };

  return (
    <div className="space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.user?.avatarUrl ? (
              <img
                src={review.user.avatarUrl}
                alt={`${review.user.firstName} ${review.user.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {/* User Info and Rating */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {review.user ? formatUserName(review.user.firstName, review.user.lastName) : 'Anonymous'}
              </span>
              {review.isVerified && (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                  <Verified className="w-3 h-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>

            {/* Rating and Date */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {review.rating}/5
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="w-4 h-4 mr-2" />
              Report Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        {/* Review Title */}
        {review.title && (
          <h4 className="font-semibold text-gray-900">
            {review.title}
          </h4>
        )}

        {/* Review Comment */}
        <p className="text-gray-700 leading-relaxed">
          {review.comment}
        </p>

        {/* Product Info (if showing in user's review list) */}
        {showProductInfo && review.product && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={review.product.images?.[0]?.imageUrl || '/images/placeholder.jpg'}
              alt={review.product.name}
              className="w-12 h-12 object-cover rounded border"
            />
            <div>
              <h5 className="font-medium text-gray-900">{review.product.name}</h5>
              <p className="text-sm text-gray-600">SKU: {review.product.sku}</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Helpful Votes */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpfulVote(true)}
              disabled={hasVoted || !user}
              className={`${
                userVote === 'helpful' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Helpful
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpfulVote(false)}
              disabled={hasVoted || !user}
              className={`${
                userVote === 'not-helpful' 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              Not helpful
            </Button>
          </div>

          {/* Helpful Count */}
          {review.helpfulCount > 0 && (
            <span className="text-sm text-gray-500">
              {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
            </span>
          )}
        </div>

        {/* Review Status Badges */}
        <div className="flex items-center gap-2">
          {!review.isApproved && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Pending Approval
            </Badge>
          )}
        </div>
      </div>

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="text-xs text-gray-500 border-t pt-3">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </a>{' '}
          to vote on reviews
        </div>
      )}
    </div>
  );
}