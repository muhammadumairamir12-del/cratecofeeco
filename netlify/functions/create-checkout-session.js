// Stripe Checkout — the only payment path.
// Set STRIPE_SECRET_KEY in the host environment (sk_test_... or sk_live_...).
// Prices are in US cents and come from this menu, not from the browser.

const MENU_CENTS = {
  "House Espresso": 325,
  "Americano": 375,
  "Cappuccino": 450,
  "Cortado": 425,
  "Coffee Flight": 1200,
  "Iced Latte": 525,
  "Iced Mocha": 550,
  "Cold Brew": 475,
  "Butter Croissant": 395,
  "Pain au Chocolat": 450,
  "Cinnamon Roll": 475,
  "Chocolate Chip Cookie": 275,
  "Sea Salt Brownie": 350,
  "Pastry Basket": 1400,
  "Chocolate Drip Cake": 3400,
  "Black Forest Cake": 3600,
  "House Blend Beans": 1600
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY is not set." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!items.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty" }) };
  }

  let successUrl;
  let cancelUrl;
  try {
    successUrl = safeReturnUrl(body.successUrl, "paid");
    cancelUrl = safeReturnUrl(body.cancelUrl, "cancelled");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Checkout return URL was rejected." }) };
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  const join = successUrl.indexOf("?") === -1 ? "?" : "&";
  params.set("success_url", successUrl + join + "session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url", cancelUrl);

  let line = 0;
  for (const item of items) {
    const name = String(item.name || "").slice(0, 80);
    const qty = Math.floor(Number(item.qty));
    let cents = MENU_CENTS[name];
    if (!cents) {
      const dollars = Number(item.price);
      if (!Number.isFinite(dollars) || dollars < 0.5 || dollars > 500) {
        return { statusCode: 400, body: JSON.stringify({ error: "Unknown item: " + name }) };
      }
      cents = Math.round(dollars * 100);
    }
    if (!name || qty < 1 || qty > 20) {
      return { statusCode: 400, body: JSON.stringify({ error: "Unknown item: " + name }) };
    }
    params.set(`line_items[${line}][quantity]`, String(qty));
    params.set(`line_items[${line}][price_data][currency]`, "usd");
    params.set(`line_items[${line}][price_data][unit_amount]`, String(cents));
    params.set(`line_items[${line}][price_data][product_data][name]`, name);
    line += 1;
  }

  if (body.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    params.set("customer_email", body.email);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + secret,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString().replace(/%7BCHECKOUT_SESSION_ID%7D/g, "{CHECKOUT_SESSION_ID}")
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: (data.error && data.error.message) || "Stripe rejected the checkout." })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: data.url })
  };
};

function safeReturnUrl(value, flag) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
  if (!url.pathname.endsWith("checkout.html")) throw new Error("bad path");
  url.searchParams.set(flag === "cancelled" ? "cancelled" : "paid", "1");
  return url.toString();
}
