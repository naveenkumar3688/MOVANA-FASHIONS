'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, User } from 'lucide-react';

export default function ProductReviews({ productId }: { productId: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newRating, setNewRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Reviews
  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (data) setReviews(data);
      setLoading(false);
    }
    fetchReviews();
  }, [productId]);

  // Submit Review
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newRating === 0) return alert("Please select a star rating!");
    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      { product_id: productId, user_name: newName, rating: newRating, comment: newComment }
    ]);

    if (!error) {
      setNewName('');
      setNewComment('');
      setNewRating(0);
      // Reload reviews instantly
      const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      if (data) setReviews(data);
      alert("Thanks for your review! 🌟");
    } else {
      alert("Error submitting review.");
    }
    setSubmitting(false);
  }

  // Calculate Average
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) 
    : "New";

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-6">Customer Reviews</h2>

      {/* 📊 SUMMARY */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl font-black">{averageRating}</div>
        <div>
          <div className="flex text-yellow-500">
             {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-yellow-500' : 'text-gray-300'}`} />
             ))}
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{reviews.length} Verified Reviews</p>
        </div>
      </div>

      {/* 📝 WRITE A REVIEW FORM */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-10">
        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
        
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-8 h-8 cursor-pointer transition ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
              onClick={() => setNewRating(star)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="p-3 border rounded-xl w-full focus:outline-none focus:border-black"
          />
        </div>
        <textarea 
          placeholder="How was the fit? The fabric?" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          className="p-3 border rounded-xl w-full h-24 mb-4 focus:outline-none focus:border-black"
        />
        <button disabled={submitting} className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition w-full md:w-auto">
          {submitting ? "Posting..." : "Submit Review"}
        </button>
      </form>

      {/* 📜 REVIEWS LIST */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-400 italic">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gray-200 p-2 rounded-full"><User className="w-4 h-4 text-gray-500"/></div>
                <span className="font-bold text-sm">{review.user_name}</span>
                <span className="text-gray-400 text-xs">• {new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}