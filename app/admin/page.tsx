'use client';

import { useState } from 'react';
import { supabase } from './../../lib/supabase';
import { PackagePlus, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  // Store the form data
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Nighties');
  
  // Store the loading/success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop page refresh
    setIsSubmitting(true);
    setSuccess('');

    // Send the data straight to your Supabase database!
    const { error } = await supabase
      .from('products')
      .insert([
        { 
          name: name, 
          price: parseFloat(price), // Convert text price to a real number
          description: description, 
          image_url: imageUrl, 
          category: category 
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      setSuccess('Product added successfully to MOVANA FASHIONS! 🎉');
      
      // Clear the form for the next product
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setCategory('Nighties');
      
      // Hide the success message after 4 seconds
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-black py-6 px-8 flex items-center gap-3">
          <PackagePlus className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold font-serif text-white tracking-widest">MOVANA ADMIN</h1>
        </div>

        {/* The Add Product Form */}
        <form onSubmit={handleAddProduct} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Royal Blue Nighty" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
              <input 
                required 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="e.g. 290" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none bg-white"
              >
                <option value="Nighties">Nighties</option>
                <option value="Towels">Towels</option>
                <option value="Lingerie">Lingerie</option>
                <option value="Trending">Trending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (From Supabase Storage)</label>
              <input 
                type="text" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="Paste the public link here..." 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Premium cotton fabric for ultimate comfort..." 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <PackagePlus className="w-6 h-6" />}
              {isSubmitting ? 'Uploading to Store...' : 'Add Product to Live Store'}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3 font-medium animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              {success}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}