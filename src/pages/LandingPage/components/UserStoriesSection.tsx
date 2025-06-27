import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Button } from '@/ui/atoms/Button';
import { ReviewCard } from '@/ui/organisms/ReviewCard';
import { mockReviews } from '../data/mockReviews';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

const UserStoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="user-stories"
      className="py-16 md:py-24 bg-black/30 backdrop-blur-lg relative overflow-hidden text-white"
    >
      {/* Tech-inspired background elements (simplified from pricing) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
      </div>

      {/* Content container needs to be relative and have a z-index to sit above the background elements */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
          Hear From Our Travelers
        </h2>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
          Discover how Planora has transformed their travel planning
          experience.
        </p>
        {/* Swiper Carousel */}
        <div className="max-w-5xl mx-auto">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 1, // Set delay to a very small number for continuous effect
              disableOnInteraction: true, // Pauses on interaction
            }}
            // pagination={{ clickable: true }} // Optional: adds dots for pagination
            // navigation={true} // Optional: adds prev/next arrows
            breakpoints={{
              // when window width is >= 768px
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              // when window width is >= 1024px
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            speed={8000} // Set a long transition speed (in ms)
            // className="pb-12" // Pagination is off, so remove padding
          >
            {mockReviews.map((review) => {
              const { id, ...reviewProps } = review; // Destructure id
              return (
                <SwiperSlide key={id}>
                  <ReviewCard {...reviewProps} />{' '}
                  {/* Pass remaining props */}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
        <div className="mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/reviews')}
            className="border-white/30 hover:border-white/60 hover:bg-white/10"
          >
            View All Reviews
          </Button>
        </div>
      </div>
    </section>
  );
};

export { UserStoriesSection }; 