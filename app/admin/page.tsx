'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Image as ImageIcon, Trash2, LogOut, Package } from 'lucide-react';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('NIGHTIES');
  const [sizesInput, setSizesInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const router = useRouter();

  // 🔒 SECURE ADMIN LOGIN CHECK (Updated with your email!)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // The bouncer now checks for your exact email!
      if (!session || session.user.email !== 'naveenkumark1206@gmail.com') {
        alert("Access Denied. Admins only.");
        router.push('/');
        return;
      }
      fetchProducts();
    };
    checkAdmin();
  }, [router]);

  const fetchProducts = async () => {
    setIsFetching(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setIsFetching(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || files.length === 0) {
      alert("Please fill all fields and select at least one image.");
      return;
    }

    setLoading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 📏 SMART SIZE FORMATTER
      const sizesArray = sizesInput.trim() ? sizesInput.split(',').map(s => s.trim().toUpperCase()) : null;

      const { error: dbError } = await supabase.from('products').insert([{
        name,
        price: parseFloat(price),
        category,
        image_url: uploadedUrls[0],
        gallery_images: uploadedUrls,
        sizes: sizesArray
      }]);

      if (dbError) throw dbError;

      alert("✨ Product successfully added!");
      setName('');
      setPrice('');
      setSizesInput(''); 
      setFiles([]);
      fetchProducts(); 

    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(`Error adding product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#111] font-sans pb-20"> {/* Upgraded to match your dark theme slightly */}
      <div className="bg-black text-white py-8 px-4 text-center relative border-b border-gray-800">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-1">MOVANA HQ</h1>
        <p className="text-gray-400 tracking-widest uppercase text-[10px]">Admin Command Center</p>
        <button onClick={() => router.push('/')} className="absolute top-8 right-6 text-xs font-bold flex items-center gap-1 hover:text-gray-300">
          <LogOut className="w-4 h-4"/> Exit
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg border border-gray-800 sticky top-24 text-white">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
              <Plus className="w-4 h-4" /> Add New Product
            </h2>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-800 outline-none text-sm text-white focus:border-gray-500 transition" placeholder="e.g. Summer Nighty" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-800 outline-none text-sm text-white focus:border-gray-500 transition" placeholder="999" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-800 outline-none text-sm uppercase text-white focus:border-gray-500 transition">
                  <option value="NIGHTIES">Nighties</option>
                  <option value="INNERWEAR">Innerwear</option>
                  <option value="LOUNGEWEAR">Loungewear</option>
                  <option value="HOME ACCESSORIES">Home Accessories</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom Sizes (Optional)</label>
                <input type="text" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-800 outline-none text-sm text-white focus:border-gray-500 transition" placeholder="e.g. XL, XXL (Leave blank if none)" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Upload Images</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer bg-black hover:bg-gray-900 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{files.length > 0 ? `${files.length} Files Selected` : 'Click to Upload'}</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition shadow-lg flex justify-center items-center gap-2 mt-4">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Package className="w-4 h-4" /> Publish Product</>}
              </button>