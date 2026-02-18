'use client' 

import { useState } from 'react'
import { useCartStore } from '../store/cartStore' // Use relative path to be safe

export default function AddToCartButton({ product }: { product: any }) {
  const [isAdded, setIsAdded] = useState(false)
  
  // We grab both functions: one to add the item, one to open the door!
  const addToCart = useCartStore((state) => state.addToCart)
  const setIsOpen = useCartStore((state) => state.setIsOpen)

  const handleClick = () => {
    // 1. Send the item to the cart
    addToCart(product) 
    
    // 2. Open the side drawer automatically
    setIsOpen(true)
    
    // 3. Show your cool green success state
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <button 
      onClick={handleClick}
      style={{ 
        backgroundColor: isAdded ? '#22c55e' : 'white', 
        color: isAdded ? 'white' : 'black' 
      }}
      className="mt-4 w-full py-3 rounded-lg font-bold transition-all duration-300 shadow-md hover:scale-[1.02] border border-gray-200"
    >
      {isAdded ? 'Added! ✅' : 'Add to Cart'}
    </button>
  )
}