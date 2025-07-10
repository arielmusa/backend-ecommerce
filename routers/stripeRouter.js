import express from "express";
import Stripe from "stripe";
import "dotenv/config";
const stripeRouter = express.Router();

// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// This is the frontend domain
const YOUR_DOMAIN = "http://localhost:5173";

// This endpoint is used to create a checkout session. It receives a cart object from the client, which contains items to be purchased.
stripeRouter.post("/create-checkout-session", async (req, res) => {
  const cart = req.body;
  const freeShipping = 600; // in €
  const shippingOptions = {
    free_shipping: {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: 0,
          currency: "eur",
        },
        display_name: "Spedizione gratuita",
        delivery_estimate: {
          minimum: {
            unit: "business_day",
            value: 5,
          },
          maximum: {
            unit: "business_day",
            value: 7,
          },
        },
      },
    },
    paid_shipping: {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: 1500,
          currency: "eur",
        },
        display_name: "Spedizione a pagamento",
        delivery_estimate: {
          minimum: {
            unit: "business_day",
            value: 5,
          },
          maximum: {
            unit: "business_day",
            value: 7,
          },
        },
      },
    },
  };
  const checkoutShippingOption =
    cart.reduce((tot, item) => tot + item.price * item.quantity, 0) >
    freeShipping
      ? shippingOptions.free_shipping
      : shippingOptions.paid_shipping;

  // Validate the cart object
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).send({ error: "Cart must be a non-empty array" });
  }

  // Convert cart into stripe's expected format
  const checkoutItems = cart.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: { name: item.name },
      unit_amount: (item.price * 100).toFixed(0),
    },
    quantity: item.quantity,
  }));

  // Create a checkout session with the provided items
  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: {
      allowed_countries: ["IT"],
    },
    shipping_options: [checkoutShippingOption],
    ui_mode: "embedded",
    line_items: checkoutItems,
    mode: "payment",
    return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({ clientSecret: session.client_secret });
});

// This endpoint is used to retrieve the status of a checkout session
stripeRouter.get("/session-status", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  });
});

export default stripeRouter;
