import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from './services/api';

interface FeedbackFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  rating: number;
  category: string;
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 0,
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await apiService.submitFeedback(formData);
      
      if (response.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          rating: 0,
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0A1A] via-[#1B1628] to-[#0F0A1A] flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1B1628]/90 to-[#2A2438]/90 backdrop-blur-sm rounded-3xl border border-[#EF8E81]/20 p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-xl text-[#FFF1E7]/80 mb-8">
              Your feedback has been sent successfully. We'll review it and get back to you soon!
            </p>
            <button
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-[#EF8E81] to-[#E67A6E] hover:from-[#E67A6E] hover:to-[#D46A5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1A] via-[#1B1628] to-[#0F0A1A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Share Your Feedback</h1>
            <p className="text-xl text-[#FFF1E7]/80 max-w-2xl mx-auto">
              Help us improve MomentumDIY by sharing your thoughts, suggestions, and experiences
            </p>
          </div>

          {/* Feedback Form */}
          <div className="bg-gradient-to-br from-[#1B1628]/90 to-[#2A2438]/90 backdrop-blur-sm rounded-3xl border border-[#EF8E81]/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-lg font-semibold text-white mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-xl text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-lg font-semibold text-white mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-xl text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Category and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-lg font-semibold text-white mb-3">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-xl text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none transition-colors"
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="ui">UI/UX Feedback</option>
                    <option value="performance">Performance Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-lg font-semibold text-white mb-3">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-xl text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none transition-colors"
                    placeholder="Brief description of your feedback"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Overall Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={`w-12 h-12 rounded-lg transition-colors ${
                        star <= formData.rating
                          ? 'text-[#EF8E81] bg-[#EF8E81]/20'
                          : 'text-gray-400 bg-gray-600/20 hover:bg-gray-500/20'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-[#FFF1E7]/60 text-sm mt-2">
                  {formData.rating === 0 ? 'Select a rating' : 
                   formData.rating === 1 ? 'Poor' :
                   formData.rating === 2 ? 'Fair' :
                   formData.rating === 3 ? 'Good' :
                   formData.rating === 4 ? 'Very Good' : 'Excellent'}
                </p>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-lg font-semibold text-white mb-3">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-xl text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none transition-colors resize-none"
                  placeholder="Please share your detailed feedback, suggestions, or report any issues you've encountered..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#EF8E81] to-[#E67A6E] hover:from-[#E67A6E] hover:to-[#D46A5A] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  {isSubmitting ? 'Sending Feedback...' : 'Send Feedback'}
                </button>
              </div>

              {submitStatus === 'error' && (
                <div className="text-center">
                  <p className="text-red-400 text-lg">
                    Sorry, there was an error sending your feedback. Please try again.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
