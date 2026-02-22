export const dynamic = 'force-dynamic'; // 🚀 THE ULTIMATE CACHE BREAKER! FORCES LIVE VAULT ACCESS!

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: `THE VAULT IS EMPTY v4! Next.js froze the keys again!` 
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