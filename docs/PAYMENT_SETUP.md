# Stripe payment setup – receive card payments in your bank account

This app uses **Stripe** for card payments. When a customer pays by card, the money goes to Stripe; Stripe then pays out to your **connected bank account** on the schedule you set in the Stripe Dashboard.

---

## 1. Create a Stripe account and connect your bank

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2. Complete business verification (KYC) so Stripe can pay you.
3. In the Dashboard go to **Settings → Payouts** and add your **bank account**.  
   Payouts will be sent to this account (e.g. daily or weekly – you choose).

---

## 2. Get your API keys

1. In Stripe Dashboard go to **Developers → API keys**.
2. Copy:
   - **Secret key** (starts with `sk_test_` in test mode, `sk_live_` in live).
   - **Publishable key** (starts with `pk_test_` / `pk_live_`) – needed later for the mobile app.

---

## 3. Configure the backend

1. In the backend folder copy `.env.example` to `.env` (or add to your existing env file):

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Set Stripe variables in `.env`:

   ```env
   STRIPE_SECRET_KEY=sk_test_xxxx
   STRIPE_CURRENCY=pkr
   ```

   - Use **Test** keys while developing; switch to **Live** keys for production.
   - `STRIPE_CURRENCY=pkr` sends amounts in **paisa** (e.g. 1000 PKR → 100000).  
     If you use `STRIPE_CURRENCY=usd`, amounts are in **cents**.

3. Restart the backend. When `STRIPE_SECRET_KEY` is set:
   - **Card** orders are created with status **pending** and a Stripe PaymentIntent is created.
   - The API response includes `clientSecret` so the mobile app can complete payment with the Stripe SDK.
   - After the customer pays, the order is marked **paid** (via confirm-payment or webhook) and product stock is decremented.

---

## 4. How the flow works

1. Customer selects **card** at checkout and taps **Submit order**.
2. Backend creates the order with `paymentStatus: 'pending'`, creates a Stripe PaymentIntent, and returns `{ order, clientSecret }`.
3. Mobile app should use the **Stripe SDK** (e.g. `@stripe/stripe-react-native`) to collect card details and confirm the payment using `clientSecret`.
4. After payment succeeds:
   - **Option A:** Mobile app calls `PATCH /api/orders/:id/confirm-payment` (with auth). Backend checks Stripe and marks the order paid, then decrements stock.
   - **Option B:** You configure a Stripe webhook (see below); when Stripe sends `payment_intent.succeeded`, the backend marks the order paid and decrements stock.

---

## 5. Optional: Stripe webhook (recommended for production)

So that orders are marked paid even if the customer closes the app right after paying:

1. In Stripe Dashboard go to **Developers → Webhooks** and add an endpoint:
   - URL: `https://your-api-domain.com/api/webhooks/stripe`
   - Event: `payment_intent.succeeded`
2. Copy the **Signing secret** (starts with `whsec_`).
3. Add to backend `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxx
   ```
4. The backend can use this to verify webhook requests and mark the order paid (webhook handler can be added to call the same logic as `confirm-payment`).

---

## 6. Mobile app (Stripe SDK)

- Install Stripe’s React Native SDK (e.g. `@stripe/stripe-react-native`).
- Use the **Publishable key** in the app (never put the Secret key in the app).
- After creating an order, if the response contains `clientSecret`:
  - Present the Stripe payment sheet (or card form).
  - On success, call `PATCH /api/orders/:orderId/confirm-payment` so the order is marked paid and stock is updated.

---

## 7. Summary

| Step | Who | Action |
|------|-----|--------|
| 1 | You | Stripe account, KYC, connect bank in Dashboard. |
| 2 | You | Copy Secret key (and Publishable key for mobile). |
| 3 | Backend | Set `STRIPE_SECRET_KEY` and `STRIPE_CURRENCY` in `.env`. |
| 4 | Mobile | Add Stripe SDK, use Publishable key and `clientSecret` to collect payment, then call confirm-payment. |
| 5 | Optional | Add webhook in Stripe and set `STRIPE_WEBHOOK_SECRET`. |

Once this is done, card payments go through Stripe and Stripe pays out to your connected bank account according to your payout schedule.
