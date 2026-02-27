'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Image as ImageIcon, Trash2, LogOut, Package } from 'lucide-react';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('NIGHTIES');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const router = useRouter();

  // 🔒 SECURE ADMIN LOGIN CHECK
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Replace this with your actual admin email!
      if (!session || session.user.email !== 'hello@movana.in') {
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

  // 📸 HANDLE MULTIPLE FILE SELECTION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert the FileList object to a normal array
      setFiles(Array.from(e.target.files));
    }
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
      // 🚀 UPLOAD EVERY SELECTED IMAGE TO SUPABASE STORAGE
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // 🚨 MAKE SURE YOUR BUCKET IS NAMED 'products' IN SUPABASE STORAGE!
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 💾 SAVE TO DATABASE
      const { error: dbError } = await supabase.from('products').insert([{
        name,
        price: parseFloat(price),
        category,
        image_url: uploadedUrls[0], // Main image for homepage
        gallery_images: uploadedUrls  // Array of ALL images for product page!
      }]);

      if (dbError) throw dbError;

      alert("✨ Product successfully added with multiple images!");
      setName('');
      setPrice('');
      setFiles([]);
      fetchProducts(); // Refresh list

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
    if (error) {
      alert("Failed to delete.");
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      {/* ADMIN HEADER */}
      <div className="bg-black text-white py-8 px-4 text-center relative">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-1">MOVANA HQ</h1>
        <p className="text-gray-400 tracking-widest uppercase text-[10px]">Admin Command Center</p>
        <button onClick={() => router.push('/')} className="absolute top-8 right-6 text-xs font-bold flex items-center gap-1 hover:text-gray-300">
          <LogOut className="w-4 h-4"/> Exit
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ADD PRODUCT FORM */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
              <Plus className="w-4 h-4" /> Add New Product
            </h2>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm" placeholder="e.g. Summer Floral Nighty" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm" placeholder="999" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm uppercase">
                  <option value="NIGHTIES">Nighties</option>
                  <option value="INNERWEAR">Innerwear</option>
                  <option value="LOUNGEWEAR">Loungewear</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Upload Images (Select Multiple)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      {files.length > 0 ? `${files.length} Files Selected` : 'Click to Upload'}
                    </p>
                  </div>
                  {/* 🚀 THE MAGIC MULTIPLE ATTRIBUTE */}
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 mt-4 disabled:bg-gray-400">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Package className="w-4 h-4" /> Publish Product</>}
              </button>
            </form>
          </div>
        </div>

        {/* INVENTORY LIST */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-4">Current Inventory</h2>
            
            {isFetching ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : products.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10">No products found. Add your first one!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex gap-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl items-center">
                    <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" alt="img" /> : null}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-black uppercase tracking-tight line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{product.category}</p>
                      <p className="text-sm font-black text-green-600 mt-1">₹{product.price}</p>
                      {/* Show how many images it has! */}
                      {product.gallery_images && (
                        <p className="text-[9px] text-blue-500 font-bold mt-1">📸 {product.gallery_images.length} Images</p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition bg-white rounded-full shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}