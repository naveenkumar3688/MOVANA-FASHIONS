import { supabase } from '../lib/supabase';
import AddToCartButton from '../components/AddtoCartButton';
import Navbar from '../components/Navbar'; // Assuming you want the navbar here too

// This is a "Server Component" - it runs on the server to get data fast!
export default async function Home() {
  
  // 1. Fetch real products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  // Safety check: If there's an error, log it, otherwise use the products
  if (error) {
    console.error("Error fetching products:", error);
  }
  
  const allProducts = products || [];

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-bold font-serif mb-4">MOVANA FASHIONS</h1>
        <p className="text-gray-300 text-lg mb-8">Comfort meets Elegance. Premium Nighties & Essentials.</p>
        <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
          Shop Now
        </button>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto p-6 md:p-12">
        <h2 className="text-3xl font-bold font-serif text-center mb-10">Our Latest Collection</h2>
        
        {allProducts.length === 0 ? (
          <p className="text-center text-gray-500">Loading products... (or check your database!)</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {allProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                {/* Product Image */}
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Quick Badge */}
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </span>
                </div>

                {/* Product Details */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold font-serif">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    {/* The Add Button connected to your Cart Drawer */}
                    <div className="w-1/2">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}