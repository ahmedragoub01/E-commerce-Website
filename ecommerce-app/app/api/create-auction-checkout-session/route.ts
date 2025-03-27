import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Auction from "@/models/Auction";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await req.json();
    const {
      userId,
      auctionId,
      productId,
      total,
      shippingAddress,
      notes,
      paymentMethod
    } = body;

    // Validate required fields
    if (!auctionId || !productId || !total) {
      return NextResponse.json({ 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify auction exists and is valid
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return NextResponse.json({ 
        message: 'Auction not found' 
      }, { status: 404 });
    }

    // Verify user is the auction winner
    if (auction.winner.toString() !== userId) {
      return NextResponse.json({ 
        message: 'Not authorized to checkout this auction' 
      }, { status: 403 });
    }

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Auction Item: ${auction.productName || 'Auction Product'}`,
              description: notes || 'Auction Winning Bid'
            },
            unit_amount: Math.round(total * 100), // Convert to cents
          },
          quantity: 1,
        },
        // Optional: Add shipping cost if applicable
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
            },
            unit_amount: 500, // $5.00 shipping
          },
          quantity: 1,
        }
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
      },
      success_url: `${process.env.NEXTAUTH_URL}/auctions-checkout?success=true&auctionId=${auctionId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auctions-checkout?canceled=true`,
      metadata: {
        auctionId,
        userId,
        productId: productId._id,
        total: total.toString(),
      },
    });

    // Return Stripe session ID
    return NextResponse.json({ 
      sessionId: stripeSession.id 
    }, { status: 200 });

  } catch (error) {
    console.error('Auction Checkout Session Error:', error);
    return NextResponse.json({ 
      message: 'Failed to create checkout session', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}