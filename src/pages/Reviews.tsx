
import { useState } from 'react';
import Layout from '../components/Layout';
import TestimonialCard from '../components/TestimonialCard';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import FeaturedProducts from '../components/FeaturedProducts';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const Reviews = () => {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'customer-reviews'>('testimonials');
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReviewSubmitted = () => {
    setReviewsRefreshTrigger(prev => prev + 1);
    setShowReviewForm(false);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setShowReviewForm(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Customer Reviews</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Real feedback from our valued customers across India
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            <Button
              onClick={() => setActiveTab('testimonials')}
              variant={activeTab === 'testimonials' ? 'default' : 'outline'}
              className={activeTab === 'testimonials' ? 'bg-black text-white' : ''}
            >
              Customer Reviews
            </Button>
            <Button
              onClick={() => setActiveTab('customer-reviews')}
              variant={activeTab === 'customer-reviews' ? 'default' : 'outline'}
              className={activeTab === 'customer-reviews' ? 'bg-black text-white' : ''}
            >
              Write a Review
            </Button>
          </div>
        </div>
      </section>

      {activeTab === 'testimonials' ? (
        <>
          {/* Reviews from Database */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <ReviewsList
                refreshTrigger={reviewsRefreshTrigger}
              />

              {/* Write Review Call-to-Action */}
              <div className="text-center mt-12">
                <div className="bg-gray-50 p-8 rounded-lg max-w-2xl mx-auto border border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Share Your Experience</h3>
                  <p className="text-gray-600 mb-6">
                    Have you tried our products? We'd love to hear about your experience!
                    Your feedback helps us continue to improve and helps other customers
                    make informed decisions.
                  </p>
                  <button
                    onClick={handleWriteReview}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {isAuthenticated ? 'Write a Review' : 'Sign In to Write a Review'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Signature Products Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">Our Signature Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Try our most loved authentic Manipuri foods that customers rave about
                </p>
              </div>
              <FeaturedProducts />
            </div>
          </section>
        </>
      ) : (
        /* Write Review Section */
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">Write a Review</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Share your experience with Presamali products. Your feedback is valuable to us and helps other customers make informed decisions.
              </p>
            </div>

            {isAuthenticated ? (
              <div className="max-w-2xl mx-auto">
                <ReviewForm
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gray-50 p-8 rounded-lg max-w-2xl mx-auto border border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Sign In Required</h3>
                  <p className="text-gray-600 mb-6">
                    Please sign in to your account to write a review.
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Review Form Modal for authenticated users on testimonials tab */}
      {showReviewForm && activeTab === 'testimonials' && isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Write a Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reviews;
