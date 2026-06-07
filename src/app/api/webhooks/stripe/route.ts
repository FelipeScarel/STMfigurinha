import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-06-15.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    // Dev mode: process without verification
    try {
      const event = JSON.parse(body) as Stripe.Event;
      await handleStripeEvent(event);
    } catch {
      // ignore malformed body in dev
    }
    return NextResponse.json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    await handleStripeEvent(event);
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "pago",
            timeline: {
              create: {
                previousStatus: "aguardando_pagamento",
                newStatus: "pago",
                message: "Pagamento confirmado via Stripe.",
                createdBy: "sistema",
              },
            },
          },
        });
      }
      break;
    }
  }
}
