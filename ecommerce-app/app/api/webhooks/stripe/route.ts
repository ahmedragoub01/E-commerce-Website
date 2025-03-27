// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Auction from "@/models/Auction"; // Import Auction model

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// This should be your Stripe webhook secret from the dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Replace with your webhook secret

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret as string
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata from the session
    const { orderId, userId, shippingAddress, notes, auctionId } = session.metadata || {};

    if (!orderId || !userId) {
      console.error("Missing required metadata in Stripe session");
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      // Existing order creation logic...
      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Format order items
      const orderItems = lineItems.data.map((item) => {
        return {
          product: item.description?.split("ID: ")[1], // Assuming product ID is in description
          quantity: item.quantity,
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        };
      });

      // Create the order in your database
      const order = new Order({
        _id: orderId, // Use the same ID generated earlier
        user: userId,
        items: orderItems,
        total: session.amount_total ? session.amount_total / 100 : 0,
        status: "paid",
        paymentIntentId: session.payment_intent,
        shippingAddress: JSON.parse(shippingAddress || "{}"),
        notes: notes || "",
      });

      await order.save();

      // Update product inventory
      for (const item of orderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { inventory: -item.quantity } }
          );
        }
      }

      // New: Handle auction payment if auctionId is present
      if (auctionId) {
        const auction = await Auction.findById(auctionId);

        if (auction) {
          auction.isPaid = true;
          auction.paidAt = new Date();
          auction.paidBy = userId;

          await auction.save();

          console.log(`Auction ${auctionId} marked as paid`);
        } else {
          console.warn(`Auction ${auctionId} not found for payment update`);
        }
      }

      console.log(`Order ${orderId} created successfully`);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 }
      );
    }
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}