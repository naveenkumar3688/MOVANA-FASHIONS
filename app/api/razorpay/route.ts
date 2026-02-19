import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// This connects to your secret keys securely
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    // Get the total amount from the customer's cart
    const { amount } = await request.json();

    // Tell Razorpay to create an official order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay calculates in paise! (₹100 = 10000 paise)
      currency: 'INR',
      receipt: 'receipt_' + Math.random().toString(36).substring(7),
    });

    // Send the Order ID back to the frontend popup
    return NextResponse.json({ orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID }, { status: 200 });
    
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}