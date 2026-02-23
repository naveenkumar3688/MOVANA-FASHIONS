'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, IndianRupee, Image as ImageIcon, Tag, AlignLeft, Package } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Womenswear');
  const [imageUrl, setImageUrl] = useState('');

  // 1. Fetch existing products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  // 2. Add a new product to the database
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      category,
      image_url: imageUrl,
    };

    const { error } = await supabase.from('products').insert([newProduct]);

    if (error) {
      alert("Error adding product: " + error.message);
    } else {
      alert("✨ Product Added Successfully!");
      // Clear the form
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      // Refresh the list
      fetchProducts();
    }
    setSubmitting(false);
  };

  // 3. Delete a product
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("Error deleting product.");
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 👑 ADMIN HEADER */}
      <div className="bg-black text-white py-12 px-4 text-center shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest mb-2 flex justify-center items-center gap-3">
          <Package className="w-8 h-8" /> MOVANA COMMAND CENTER
        </h1>
        <p className="text-gray-400 tracking-widest uppercase text-xs">Store Management Dashboard</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 📝 LEFT COLUMN: ADD PRODUCT FORM */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b pb-4">Add New Product</h2>
          
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
              <div className="relative">
                <Tag className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition" placeholder="e.g. Premium Cotton Nighty" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
              <div className="relative">
                <IndianRupee className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition" placeholder="499" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition cursor-pointer">
                <option value="Womenswear">Womenswear</option>
                <option value="Menswear">Menswear</option>
                <option value="Kidswear">Kidswear</option>
                <option value="Home Accessories">Home Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL</label>
              <div className="relative">
                <ImageIcon className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
                <input type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition" placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <div className="relative">
                <AlignLeft className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition" placeholder="Ultra-soft cotton material..." />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg disabled:bg-gray-400">
              {submitting ? 'Uploading...' : <><Plus className="w-5 h-5" /> Publish Product</>}
            </button>
          </form>
        </div>

        {/* 📦 RIGHT COLUMN: PRODUCT INVENTORY */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b pb-4">Live Inventory ({products.length})</h2>
          
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Loading Inventory...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Vault is Empty</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map(product => (
                <div key={product.id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:shadow-md transition bg-gray-50">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest">No Img</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-tight line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{product.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-sm">₹{product.price}</span>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}