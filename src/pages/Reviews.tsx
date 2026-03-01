import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

import { useToast } from '@/hooks/use-toast';
import { Home, Star, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  user_name: string;
  created_at: string;
}

const Reviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Review Required',
        description: 'Please write your review.',
      });
      return;
    }

    setSubmitting(true);

    const userName = 'Guest';

    const { error } = await supabase.from('reviews').insert({
      user_id: `guest_${Date.now()}`,
      rating,
      review_text: reviewText.trim(),
      user_name: userName,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit',
        description: 'Could not submit your review. Please try again.',
      });
    } else {
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      setReviewText('');
      setRating(5);
      fetchReviews();
    }

    setSubmitting(false);
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoveredStar(star)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 sm:h-6 sm:w-6 ${
              star <= (interactive ? hoveredStar || value : value)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="ROOMYFY Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            <span className="text-lg sm:text-xl font-bold roomyfy-text-gradient">ROOMYFY</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/design/new">
              <Button size="sm" className="roomyfy-gradient">Start Designing</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="roomyfy-text-gradient">Users Say</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Real feedback from users who transformed their spaces with ROOMYFY
          </p>
        </motion.div>

        {/* Submit Review Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="roomyfy-card-shadow roomyfy-border-glow mb-8 sm:mb-12 max-w-2xl mx-auto">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                Share Your Experience
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm text-muted-foreground">Your Rating</label>
                  <StarRating value={rating} interactive />
                </div>
                <div>
                  <Textarea
                    placeholder="Write your review here..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full roomyfy-gradient"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full roomyfy-card-shadow hover:scale-[1.02] transition-transform">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full roomyfy-gradient flex items-center justify-center text-primary-foreground font-bold">
                          {review.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{review.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <StarRating value={review.rating} />
                    <p className="mt-3 text-sm sm:text-base text-muted-foreground line-clamp-4">
                      {review.review_text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reviews;
