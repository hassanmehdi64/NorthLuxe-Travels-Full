import Stripe from "stripe";
import { env } from "../config/env.js";

let client = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

/** The Stripe SDK client, or null when STRIPE_SECRET_KEY is not configured. */
export const getStripe = () => client;

/** Tests only: replace the Stripe client with a stub (never hit the real API in tests). */
export const setStripeClientForTests = (stub) => {
  if (process.env.NODE_ENV !== "test") throw new Error("setStripeClientForTests is test-only");
  client = stub;
};
