'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Trash2, RefreshCcw } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Nighties',
    image_url: '',
    description: ''
  });

  // 1. Fetch Products Logic
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  // Load products when page opens
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Upload Logic
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('products').insert([{
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      image_url: formData.image_url,
      description: formData.description,
    }]);

    if (error) {
      setMessage('❌ Error: ' + error.message);
    } else {
      setMessage('✅ Product Added!');
      setFormData({ name: '', price: '', category: 'Nighties', image_url: '', description: '' });
      fetchProducts(); // Refresh the list immediately!
    }
    setLoading(false);
  };

  // 3. Delete Logic
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // Remove it from the screen immediately
      setProducts(products.filter(product => product.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT SIDE: UPLOAD FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-xl h-fit">
          <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
          
          {message && (
            <div className={`p-3 rounded mb-4 text-sm ${message.includes('Success') || message.includes('Added') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Product Name" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Price ₹" />
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                <option>Nighties</option>
                <option>Towels</option>
                <option>Kids Wear</option>
              </select>
            </div>
            <input type="url" name="image_url" required value={formData.image_url} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Image URL" />
            <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Description" />
            
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Add Product
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: INVENTORY LIST */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Inventory ({products.length})</h2>
            <button onClick={fetchProducts} className="p-2 hover:bg-gray-100 rounded-full"><RefreshCcw size={20} /></button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {products.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">No products found.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex gap-4 items-center border-b pb-4 last:border-0">
                  {/* Small Image Preview */}
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="font-bold text-green-600">₹{product.price}</p>
                  </div>

                  {/* THE DELETE BUTTON */}
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Product"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}