'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Plus, Image as ImageIcon, Trash2, LogOut, 
  Package, Scale, Layers, Edit, Save, X, ArrowLeft, ArrowRight 
} from 'lucide-react';

export default function AdminPage() {
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('NIGHTIES');
  const [weight, setWeight] = useState('0.5'); 
  const [quantity, setQuantity] = useState('10');
  const [sizesInput, setSizesInput] = useState('');
  
  // 🖼️ ADVANCED GALLERY STATE
  // We store both existing URLs and new Files in one list so you can reorder them!
  type GalleryItem = {
    id: string;      // Unique ID for React keys
    url: string;     // The preview URL (or real URL)
    file?: File;     // If it's a new upload, this holds the file
    isNew: boolean;  // True if uploaded just now
  };
  
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 🔒 SECURE ADMIN LOGIN CHECK
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  // 🔄 START EDITING
  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || ''); // Handle missing description
    setPrice(product.price);
    setCategory(product.category);
    setWeight(product.weight || 0.5);
    setQuantity(product.quantity || 10);
    setSizesInput(product.sizes ? product.sizes.join(', ') : '');

    // Convert existing images to GalleryItems
    const existingImages = product.gallery_images || (product.image_url ? [product.image_url] : []);
    const formattedGallery = existingImages.map((url: string) => ({
      id: url, // Use URL as ID for existing
      url: url,
      isNew: false
    }));
    setGalleryItems(formattedGallery);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setWeight('0.5');
    setQuantity('10');
    setSizesInput('');
    setGalleryItems([]);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 📸 IMAGE HANDLING
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36), // Temp ID
        url: URL.createObjectURL(file), // Preview URL
        file: file,
        isNew: true
      }));
      setGalleryItems(prev => [...prev, ...newFiles]); // Append to end
    }
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newItems = [...galleryItems];
    if (direction === 'left' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'right' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setGalleryItems(newItems);
  };

  // 💾 SAVE / UPDATE PRODUCT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || galleryItems.length === 0) {
      alert("Please fill name, price and add at least one image.");
      return;
    }

    setLoading(true);
    const finalImageUrls: string[] = [];

    try {
      // 1. Upload NEW images only
      for (const item of galleryItems) {
        if (item.isNew && item.file) {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('products').upload(fileName, item.file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('products').getPublicUrl(fileName);
          finalImageUrls.push(data.publicUrl);
        } else {
          // Keep existing URL
          finalImageUrls.push(item.url);
        }
      }

      const sizesArray = sizesInput.trim() ? sizesInput.split(',').map(s => s.trim().toUpperCase()) : null;

      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        weight: parseFloat(weight),
        quantity: parseInt(quantity),
        image_url: finalImageUrls[0], // First image is MAIN image
        gallery_images: finalImageUrls,
        sizes: sizesArray
      };

      if (editingId) {
        // UPDATE Existing
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        alert("✅ Product Updated Successfully!");
      } else {
        // CREATE New
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert("✨ Product Created Successfully!");
      }

      resetForm();
      fetchProducts(); 

    } catch (error: any) {
      console.error("Save Error:", error);
      alert(`Error saving product: ${error.message}`);
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
    <div className="min-h-screen bg-[#111] font-sans pb-20">
      <div className="bg-black text-white py-8 px-4 text-center relative border-b border-gray-800">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-1">MOVANA HQ</h1>
        <p className="text-gray-400 tracking-widest uppercase text-[10px]">Admin Command Center</p>
        <button onClick={() => router.push('/')} className="absolute top-8 right-6 text-xs font-bold flex items-center gap-1 hover:text-gray-300">
          <LogOut className="w-4 h-4"/> Exit
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 📝 FORM SECTION (Left Side) */}
        <div className="md:col-span-1">
          <div className={`p-6 rounded-3xl shadow-lg border sticky top-24 text-white transition-colors ${editingId ? 'bg-blue-900/20 border-blue-500' : 'bg-[#1a1a1a] border-gray-800'}`}>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
              {editingId ? <><Edit className="w-4 h-4 text-blue-400" /> Edit Product</> : <><Plus className="w-4 h-4" /> Add New Product</>}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition" placeholder="e.g. Summer Nighty" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition resize-none" placeholder="Details about fabric, fit, etc." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition" placeholder="999" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weight (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition" placeholder="0.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Qty</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition" placeholder="10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm uppercase text-white focus:border-white transition">
                    <option value="NIGHTIES">Nighties</option>
                    <option value="INNERWEAR">Innerwear</option>
                    <option value="LOUNGEWEAR">Loungewear</option>
                    <option value="HOME ACCESSORIES">Home Accessories</option>
                    <option value="MENSWEAR">Menswear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sizes (Comma separated)</label>
                <input type="text" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} className="w-full px-4 py-3 bg-black rounded-xl border border-gray-700 outline-none text-sm text-white focus:border-white transition" placeholder="XL, XXL" />
              </div>

              {/* 📸 GALLERY MANAGER */}
              <div className="bg-black p-4 rounded-xl border border-gray-800">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Gallery ({galleryItems.length})</span>
                  <span className="text-blue-400">First image is Main</span>
                </label>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryItems.map((item, index) => (
                    <div key={item.id} className="relative aspect-[3/4] group">
                      <img src={item.url} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-700" />
                      {/* Controls */}
                      <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center gap-2 rounded-lg">
                        <div className="flex gap-2">
                           {index > 0 && <button type="button" onClick={() => moveImage(index, 'left')} className="p-1 bg-white text-black rounded-full"><ArrowLeft className="w-3 h-3"/></button>}
                           {index < galleryItems.length - 1 && <button type="button" onClick={() => moveImage(index, 'right')} className="p-1 bg-white text-black rounded-full"><ArrowRight className="w-3 h-3"/></button>}
                        </div>
                        <button type="button" onClick={() => removeGalleryItem(index)} className="p-1 bg-red-600 text-white rounded-full"><Trash2 className="w-3 h-3"/></button>
                      </div>
                      {index === 0 && <span className="absolute top-1 left-1 bg-green-500 text-black text-[8px] font-bold px-1 rounded">MAIN</span>}
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  <label className="aspect-[3/4] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-white hover:bg-gray-900 transition text-gray-500 hover:text-white">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold uppercase">Add</span>
                    <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-700 transition">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={loading} className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition shadow-lg flex justify-center items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingId ? <><Save className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Publish</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 📦 INVENTORY LIST (Right Side) */}
        <div className="md:col-span-2">
          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg border border-gray-800 text-white">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Current Inventory</h2>
            {isFetching ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-600" /></div>
            ) : products.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className={`flex gap-4 p-3 border rounded-2xl items-center transition-all ${editingId === product.id ? 'bg-blue-900/10 border-blue-500 ring-1 ring-blue-500' : 'bg-black border-gray-800 hover:border-gray-600'}`}>
                    <div className="w-16 h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 relative">
                      {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" alt="img" />}
                      <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-[8px] font-bold px-1 rounded-tl">{product.gallery_images?.length || 1} pics</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{product.category}</p>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-green-500">₹{product.price}</p>
                        <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1"><Layers className="w-3 h-3"/> {product.quantity}</p>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Scale className="w-3 h-3"/> {product.weight} kg</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditClick(product)} className="p-2 text-blue-400 hover:text-white transition bg-gray-900 rounded-full hover:bg-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-white transition bg-gray-900 rounded-full hover:bg-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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