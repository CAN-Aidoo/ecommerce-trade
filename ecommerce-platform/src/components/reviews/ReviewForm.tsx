import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewFormProps {
  onSubmit: (review: Partial<Review>) => void;
  onCancel: () => void;
  initialData?: Partial<Review>;
}

export function ReviewForm({ onSubmit, onCancel, initialData }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim()
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair', 
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Overall Rating *</Label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      starValue <= displayRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {displayRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{displayRating}</span>
              <span className="text-sm text-gray-600">
                {ratingLabels[displayRating as keyof typeof ratingLabels]}
              </span>
            </div>
          )}
        </div>
        {rating === 0 && (
          <p className="text-sm text-gray-500">Click on the stars to rate this product</p>
        )}
      </div>

      {/* Review Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          Review Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience (optional)"
          maxLength={100}
        />
        <p className="text-xs text-gray-500">
          {title.length}/100 characters
        </p>
      </div>

      {/* Review Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-base font-medium">
          Your Review *
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product. What did you like or dislike? How did it compare to your expectations?"
          rows={5}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500">
          {comment.length}/1000 characters • Minimum 10 characters
        </p>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus on your experience with the product</li>
          <li>• Be honest and helpful to other customers</li>
          <li>• Include specific details about quality, performance, or value</li>
          <li>• Avoid personal information or inappropriate content</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="min-w-24"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {/* Form Validation Messages */}
      {rating === 0 && (
        <p className="text-sm text-red-600">Please select a star rating</p>
      )}
      {comment.trim().length < 10 && comment.length > 0 && (
        <p className="text-sm text-red-600">Review must be at least 10 characters long</p>
      )}
    </form>
  );
}