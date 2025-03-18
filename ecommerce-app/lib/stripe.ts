// lib/stripe.ts
import { Stripe } from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;

// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import stripe from '@/lib/stripe';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { items, shippingAddress } = await req.json();
    
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Get product details from database
    const productIds = items.map((item: any) => new mongoose.Types.ObjectId(item.productId));
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Create line items for Stripe
    const lineItems = items.map((item: any) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.images,
          },
          unit_amount: product.price * 100, // Stripe requires amount in cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId: session.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    // Create order in database
    await Order.create({
      user: new mongoose.Types.ObjectId(session.user.id),
      items: items.map((item: any) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        return {
          product: new mongoose.Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: product.price,
        };
      }),
      total: lineItems.reduce((acc: number, item: any) => acc + (item.price_data.unit_amount * item.quantity) / 100, 0),
      status: 'pending',
      paymentIntentId: stripeSession.payment_intent as string,
      shippingAddress,
    });

    return NextResponse.json({ id: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import stripe from '@/lib/stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import mongoose from 'mongoose';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }
    
    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await dbConnect();
      
      // Update order status
      await Order.updateOne(
        { paymentIntentId: session.payment_intent },
        { $set: { status: 'processing' } }
      );
      
      // Clear user's cart
      if (session.metadata?.userId) {
        const userId = new mongoose.Types.ObjectId(session.metadata.userId);
        
        await Cart.updateOne(
          { user: userId },
          { $set: { items: [], total: 0 } }
        );
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}