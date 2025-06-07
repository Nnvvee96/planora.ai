import React, { useState, useMemo } from 'react';
import { Navigation } from '@/ui/organisms/Navigation'; // Adjusted path assuming standard alias or direct relative path
import { Footer } from '@/ui/organisms/Footer'; // Adjusted path
import { ReviewCard, ReviewCardProps } from '@/ui/organisms/ReviewCard';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Textarea } from '@/ui/atoms/Textarea';
import { Label } from '@/ui/atoms/Label';
import { Select, SelectOption } from '@/components/ui/select';
import { X, Star } from 'lucide-react';

// Define a type for the review data including id, extending ReviewCardProps
interface ReviewData extends ReviewCardProps {
  id: string;
  title?: string; // Optional title for reviews
}

const mockReviews: ReviewData[] = [
  {
    id: '1',
    title: 'Euro Trip Made Easy!',
    authorName: 'Sarah L.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    reviewText: "Planora made my Euro trip planning a breeze! I discovered so many hidden gems I wouldn't have found otherwise. The itinerary was perfectly paced.",
    date: 'June 2024',
    source: 'Planora App'
  },
  {
    id: '2',
    title: 'Great for Complex Trips',
    authorName: 'Mike P.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    reviewText: 'Really intuitive and helpful for organizing complex trips. Saved me hours of research. The collaboration feature is a plus for group travel!',
    date: 'May 2024',
    source: 'Google Play'
  },
  {
    id: '3',
    title: 'Planning is Fun Now!',
    authorName: 'Jessica Chen',
    rating: 5,
    reviewText: "I used to dread planning vacations, but Planora actually made it fun! The AI suggestions were spot on. Highly recommend this app.",
    date: 'May 2024',
    source: 'App Store'
  },
  {
    id: '4',
    authorName: 'David K.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4,
    reviewText: "A solid travel planner with a sleek interface. The offline maps were a lifesaver during my trip. Would love to see more direct booking integrations.",
    date: 'April 2024',
    source: 'Planora App'
  },
  {
    id: '5',
    authorName: 'Emily R.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    reviewText: "Absolutely essential for anyone who loves to travel but hates the hassle of planning. My go-to app for all my adventures now!",
    date: 'April 2024',
    source: 'Google Play'
  },
  {
    id: '6',
    authorName: 'Tom B.',
    rating: 4,
    reviewText: "Great for discovering new destinations and activities. The budget tracker is also a nice touch. Overall, a very useful tool for travelers.",
    date: 'March 2024',
    source: 'App Store'
  }
];

export const ReviewsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDescription, setReviewDescription] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [starFilter, setStarFilter] = useState<number | null>(null); // null for 'All Stars'
  const [sortOrder, setSortOrder] = useState<string>('newest'); // 'newest', 'oldest', 'highest', 'lowest'

  const starFilterOptions: SelectOption[] = [
    { value: '', label: 'All Stars' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  const sortOrderOptions: SelectOption[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
  ];

  const openModal = () => setIsModalOpen(true);

  const displayedReviews = useMemo(() => {
    let reviews = [...mockReviews];
    if (starFilter !== null) {
      reviews = reviews.filter(review => review.rating === starFilter);
    }
    // Create a new sorted array to avoid mutating the 'reviews' array if it's directly from mockReviews or state
    // For sorting, it's often better to sort a copy if the original source shouldn't be mutated.
    // However, since 'reviews' here is already a copy ([...mockReviews]), we can sort it in place.
    switch (sortOrder) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    return reviews;
  }, [mockReviews, starFilter, sortOrder]);

  const closeModal = () => {
    setIsModalOpen(false);
    setReviewTitle('');
    setReviewDescription('');
    setReviewRating(5);
  };

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('New Review Submitted:', { title: reviewTitle, description: reviewDescription, rating: reviewRating });
    // Here you would typically send data to a backend
    // For now, we'll just add it to the mockReviews array for demonstration
    const newReview: ReviewData = {
        id: String(mockReviews.length + 1),
        title: reviewTitle,
        authorName: 'New User', // Placeholder
        rating: Number(reviewRating),
        reviewText: reviewDescription,
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        source: 'Planora App'
    };
    mockReviews.unshift(newReview); // Add to the beginning of the list
    closeModal();
  };

  return (
    <>
      <Navigation />
      <section id="reviews-page" className="py-16 md:py-24 bg-black/30 backdrop-blur-lg relative overflow-hidden text-white min-h-screen">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Hear From Our Travelers</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Discover how Planora has transformed travel planning for users just like you. Real stories, real experiences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 md:px-0">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <p className="text-sm text-white/60">Filtering options coming soon!</p>
            {/* Placeholder for filter inputs */}
          </div>
          <Button onClick={openModal} variant="gradient" size="lg" className="shadow-lg">
            Leave a Review
          </Button>
        </div>

        {/* Filters and Sorting UI */}
        <div className="relative z-10 my-10 p-4 bg-black/10 backdrop-blur-md rounded-lg shadow-md border border-planora-accent-purple/50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="starFilterSelect" className="text-white/90">Filter by Rating:</Label>
            <Select
              options={starFilterOptions}
              value={starFilter === null ? '' : String(starFilter)}
              onValueChange={(value) => setStarFilter(value === '' ? null : Number(value))}
              placeholder="All Stars"
              className="min-w-[150px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="sortOrderSelect" className="text-white/90">Sort by:</Label>
            <Select
              options={sortOrderOptions}
              value={sortOrder}
              onValueChange={setSortOrder}
              placeholder="Newest First"
              className="min-w-[150px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedReviews.map(({ id, ...reviewProps }) => (
            <ReviewCard key={id} {...reviewProps} className="bg-white/5 backdrop-blur-md shadow-xl" />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out animate-fadeIn">
          <div className="bg-planora-gray-dark p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out animate-scaleUp text-white border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold gradient-text">Share Your Experience</h2>
              <Button onClick={closeModal} variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <X size={24} />
              </Button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <Label htmlFor="reviewTitle" className="block text-sm font-medium text-white/90 mb-1">Review Title</Label>
                <Input 
                  id="reviewTitle" 
                  type="text" 
                  value={reviewTitle} 
                  onChange={(e) => setReviewTitle(e.target.value)} 
                  placeholder="e.g., Amazing Trip to Italy!" 
                  className="w-full bg-white/5 border-white/20 focus:ring-planora-blue focus:border-planora-blue"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="reviewDescription" className="block text-sm font-medium text-white/90 mb-1">Your Review</Label>
                <Textarea 
                  id="reviewDescription" 
                  value={reviewDescription} 
                  onChange={(e) => setReviewDescription(e.target.value)} 
                  placeholder="Tell us about your experience..." 
                  rows={4} 
                  className="w-full bg-white/5 border-white/20 focus:ring-planora-blue focus:border-planora-blue"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="reviewRating" className="block text-sm font-medium text-white/90 mb-1">Your Rating</Label>
                <div id="reviewRating" className="flex items-center space-x-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      size={28} // Larger stars for easier interaction
                      className={`transition-colors duration-150 ease-in-out ${(hoverRating || reviewRating) >= starIndex ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
                      onClick={() => setReviewRating(starIndex)}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-2">
                <Button type="button" onClick={closeModal} variant="secondary" className="bg-white/10 hover:bg-white/20">
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="shadow-lg">
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
    <Footer />
    </>
  );
};
