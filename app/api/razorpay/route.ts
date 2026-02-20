import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    // 🚨 SAFELY HIDDEN INSIDE THE FUNCTION!
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const { amount } = await request.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay calculates in paise
      currency: 'INR',
      receipt: 'receipt_' + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID }, { status: 200 });
    
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}