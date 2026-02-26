export const dynamic = 'force-dynamic'; // 🚀 THE ULTIMATE CACHE BREAKER!

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    // 🛠️ FIX: Now it looks for the exact NEXT_PUBLIC key we put in Vercel!
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: `THE VAULT IS EMPTY! Keys are missing from Vercel.` 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { amount } = await request.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, 
      currency: 'INR',
      receipt: 'receipt_' + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id, keyId: keyId }, { status: 200 });
    
  } catch (error: any) {
    console.error("Razorpay Backend Error:", error);
    return NextResponse.json({ error: error.message || 'Razorpay rejected the keys' }, { status: 500 });
  }
}