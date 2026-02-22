import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 🚨 SONAR PING: Ask Vercel to show us the NAMES of any keys it has that contain "RAZORPAY"
    const allKeys = Object.keys(process.env);
    const razorpayKeys = allKeys.filter(k => k.includes('RAZORPAY'));

    // If the vault is empty, immediately sound the alarm to the frontend!
    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: `THE VAULT IS EMPTY v3! The keys Vercel actually sees are: [${razorpayKeys.join(', ')}]` 
      }, { status: 500 });
    }

    // If keys exist, try to connect to Razorpay
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