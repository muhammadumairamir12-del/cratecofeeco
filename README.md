# Crate Coffee Co — Demo Website

A full ordering website + owner admin panel for a cakes/pastries/cookies/syrups
shop, built as plain HTML/CSS/JS with Firebase as the live backend (no build
step, no server to run).

## What's in the box

**Customer site**
- `index.html` — animated hero, featured items
- `menu.html` — full catalogue with category filters, live from Firestore
- `checkout.html` — delivery details + **in-site checkout** (replaces
  WhatsApp ordering, closer to a Foodpanda-style flow)
- `track-order.html` — customer order-status lookup
- `location.html`, `about.html`, `contact.html`

**Admin panel** (`/admin`)
- `login.html` — Firebase Auth email/password sign-in
- `dashboard.html` — today's orders, today's sales, popular items, 7-day chart
- `products.html` — add/edit/delete products, categories, photo upload, in-stock toggle
- `orders.html` — live order list, status pipeline (Received → Preparing → Ready → Completed)
- `settings.html` — owner-editable hours, address, phone, WhatsApp, social links
- `reports.html` — daily/weekly/monthly sales totals + trend chart

Everything reads and writes to the Firestore project you supplied
(`doorskill-beff1`), so the moment it's hosted anywhere, it's live —
that's a genuine working demo, not mocked-up screens.

## Payment — read this first

This demo ships with an **in-site checkout that simulates payment** (clearly
labelled "demo — no card is charged" on the page). No real gateway is wired
up, because that needs a merchant account and secret keys that only the shop
owner can obtain. To take real payments before launch, connect a gateway
that supports Pakistan, e.g. **JazzCash, Easypaisa, PayFast, or Stripe**, on
the "Place order" step in `checkout.html`. Cash on delivery already works
end-to-end with no changes needed.

## One-time Firebase setup

The config in `js/firebase-init.js` is already wired to your project. Three
things need to be turned on in the [Firebase console](https://console.firebase.google.com/project/doorskill-beff1):

1. **Firestore Database** → Create database (if not already created).
2. **Authentication** → Sign-in method → enable **Email/Password** → then
   Users → **Add user** to create your admin login (this is the only manual
   step — Claude can't create this account for you).
3. **Storage** → Get started (needed for the product-photo upload in the
   admin panel; everything else works without it).

### Firestore security rules

Firestore usually starts in a wide-open **test mode** — fine for this demo,
**not fine to leave on at launch**. Before going live, use rules like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() { return request.auth != null; }

    match /products/{id}  { allow read: if true; allow write: if isAdmin(); }
    match /settings/{id}  { allow read: if true; allow write: if isAdmin(); }
    match /orders/{id}    { allow create: if true; allow read, update, delete: if isAdmin(); }
    match /messages/{id}  { allow create: if true; allow read, update, delete: if isAdmin(); }
  }
}
```

This lets customers place orders and browse the menu, but only a signed-in
admin can read the order list, edit products, or change settings.

**Note on `track-order.html`:** for simplicity this demo page reads the
`orders` collection directly in the browser to find a match. That's fine
behind test-mode rules, but the rule set above will block it (by design —
it stops strangers from browsing every order). Before launch, move the
lookup behind a small Cloud Function, or drop the page if you'd rather
handle status updates by WhatsApp/SMS instead.

### Storage rules (for product photo uploads)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Getting it running

Because the pages use `fetch`-style Firestore calls, open them through a
local server rather than double-clicking the file (any of these work):

```
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`. For a real deployment, the simplest
options are **Firebase Hosting** (`firebase deploy`, since the project
already exists) or drag-and-drop onto **Netlify**.

## Seeding sample products

The first time Firestore has no products, `admin/dashboard.html` shows a
**"Seed demo catalogue"** button that adds the 12 sample cakes/pastries/
cookies/syrups used in the screenshots, plus default hours and contact
info, so the site isn't empty on first load.

## About the product photos

To avoid using photos from Instagram without permission, this demo uses a
consistent set of hand-drawn **stamp-style icons** (cake, pastry, cookie,
bottle) as placeholder product art — a deliberate design choice that fits
the crate/kraft branding, not a corner cut. Swap in real photography any
time from **Admin → Products → Edit → Product photo**; uploaded photos
automatically replace the icon everywhere on the site.

## Design notes

Palette is dark espresso, kraft-paper cream and roast-gold, with a stencil-
crate motif standing in for the product photography. Headline type is
Fraunces (serif), body is Work Sans — loaded from Google Fonts.

## Suggested next steps before a real launch

- Real payment gateway on `checkout.html`
- Lock down Firestore/Storage rules (see above)
- Real product photography
- A privacy policy / terms page if taking online payments
- Custom domain + SSL (automatic with Firebase Hosting/Netlify)
