import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const StripeSDK = require("stripe") as typeof import("stripe").default;
  return new StripeSDK(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia" as any,
  });
}

export async function POST(req: Request) {
  const body = await req.text();

  // Dev mode: process without verification when no Stripe configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      const event = JSON.parse(body);
      await handleStripeEvent(event);
    } catch {
      // ignore malformed body in dev
    }
    return NextResponse.json({ received: true });
  }

  try {
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

    const signature = req.headers.get("stripe-signature")!;
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

async function handleStripeEvent(event: any) {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
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
