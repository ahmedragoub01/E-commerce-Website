import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb"; // Adjust the import path as needed
import Auction from "@/models/Auction"; // Adjust the import path as needed

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest API version
});

// Webhook secret for verifying the event
const webhookSecret = "your_stripe_webhook_secret"; // Replace with your actual webhook secret

export async function POST(req: Request) {
  try {
    // Parse request body
    const data = await req.json();
    const { items, total, shippingAddress, notes, userId, paymentMethod, auctionId } = data;

    // Create a unique order ID
    const orderId = `order_${Date.now()}`;

    if (paymentMethod === "stripe") {
      // Format line items for Stripe
      const lineItems = items.map((item: any) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product?.name || "Product",
              description: `Quantity: ${item.quantity}`,
            },
            unit_amount: Math.round(item.price * 100), // Stripe requires amounts in cents
          },
          quantity: item.quantity,
        };
      });

      // Add shipping as a line item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
          },
          unit_amount: 500, // $5.00 in cents
        },
        quantity: 1,
      });

      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/checkout?success=true&order=${orderId}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
        metadata: {
          orderId: orderId,
          userId: userId,
          auctionId: auctionId, // Include auctionId in metadata
          shippingAddress: JSON.stringify(shippingAddress),
          notes: notes || "",
        },
      });

      // Return the session ID and order ID
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        orderId: orderId,
      });
    } else {
      // Handle non-Stripe payment method (cash on delivery)
      return NextResponse.json({
        success: true,
        orderId: orderId,
      });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe events
export async function handler(req: Request) {
  const signature = req.headers.get("stripe-signature");

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature as string,
      webhookSecret
    );

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { auctionId, userId } = session.metadata;

      // Connect to the database
      await connectDB();

      // Update the auction's isPaid status
      if (auctionId) {
        await Auction.findByIdAndUpdate(auctionId, { 
          isPaid: true,
          paidAt: new Date(),
          paidBy: userId
        });
      }

      // Here you would typically also create an order in your database
      // with the details from the session metadata
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}

// Optional: GET method to handle success/cancel redirects
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const success = searchParams.get('success');
  const orderId = searchParams.get('order');

  if (success) {
    // Redirect to a success page or handle successful payment
    return NextResponse.redirect(new URL(`/order-confirmation?orderId=${orderId}`, req.url));
  }

  // Handle canceled payment
  return NextResponse.redirect(new URL('/checkout', req.url));
}