/**
 * Mock Reviews Data
 * 
 * Customer testimonials and reviews for the landing page
 */

import { ReviewCardProps } from "@/ui/organisms/ReviewCard";

// Define a type for the review data including id, extending ReviewCardProps
export interface ReviewData extends ReviewCardProps {
  id: string;
}

export const mockReviews: ReviewData[] = [
  {
    id: "1",
    authorName: "Sarah L.",
    authorAvatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    reviewText:
      "Planora made my Euro trip planning a breeze! I discovered so many hidden gems I wouldn't have found otherwise. The itinerary was perfectly paced.",
    date: "June 2024",
    source: "Planora App",
  },
  {
    id: "2",
    authorName: "Mike P.",
    authorAvatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4,
    reviewText:
      "Really intuitive and helpful for organizing complex trips. Saved me hours of research. The collaboration feature is a plus for group travel!",
    date: "May 2024",
    source: "Google Play",
  },
  {
    id: "3",
    authorName: "Jessica Chen",
    rating: 5,
    reviewText:
      "I used to dread planning vacations, but Planora actually made it fun! The AI suggestions were spot on. Highly recommend this app.",
    date: "May 2024",
    source: "App Store",
  },
  {
    id: "4",
    authorName: "David K.",
    authorAvatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4,
    reviewText:
      "A solid travel planner with a sleek interface. The offline maps were a lifesaver during my trip. Would love to see more direct booking integrations.",
    date: "April 2024",
    source: "Planora App",
  },
  {
    id: "5",
    authorName: "Emily R.",
    authorAvatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    reviewText:
      "Absolutely essential for anyone who loves to travel but hates the hassle of planning. My go-to app for all my adventures now!",
    date: "April 2024",
    source: "Google Play",
  },
  {
    id: "6",
    authorName: "Tom B.",
    rating: 4,
    reviewText:
      "Great for discovering new destinations and activities. The budget tracker is also a nice touch. Overall, a very useful tool for travelers.",
    date: "March 2024",
    source: "App Store",
  },
]; 