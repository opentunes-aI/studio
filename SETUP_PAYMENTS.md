# 💰 Setting Up Payments (Stripe)

Opentunes Studio uses **Stripe** to handle credit purchases. Follow this guide to configure the payment system.

## 1. Get API Keys
1.  Go to [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Switch to **Test Mode** (toggle in top right).
3.  Go to **Developers > API keys**.
4.  Copy the **Secret Key** (`sk_test_...`).

## 2. Configure Environment
Add the following to your `.env` (or `.env.local` for Studio):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (for redirecting back after payment)
NEXT_PUBLIC_APP_URL=http://localhost:7865
```

## 3. Create Products (Price IDs)

### A. Subscription Plans (Recurring)
These should be set up as **Recurring** prices in Stripe.

| Plan Name | Credits | Price/Mo | Features | ID (Code Expectation) |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | 500 | $5.00 | Standard Queue | `price_starter_sub` |
| **Creator** | 1,200 | $10.00 | Priority, Commercial | `price_creator_sub` |
| **Studio** | 3,000 | $20.00 | Instant, Fine-tuning | `price_studio_sub` |

### B. Top-up Packs (One-time)
These should be set up as **One-time** prices in Stripe.

| Pack Name | Credits | Price | ID (Code Expectation) |
| :--- | :--- | :--- | :--- |
| **Refill 500** | 500 | $5.00 | `price_pack_500` |
| **Refill 1200** | 1,200 | $10.00 | `price_pack_1200` |

*Note: You must create these Products in Stripe and update `CreditDialog.tsx` with your actual price IDs (`price_...`) unless you configure Lookup Keys.*

## 4. Testing Webhooks (Local Development)
To test if credits are actually added after payment, you need to forward Stripe webhooks to your local API.

1.  **Install Stripe CLI**: [Instructions](https://docs.stripe.com/stripe-cli)
2.  **Login**: `stripe login`
3.  **Listen**: Forward events to your backend API:
    ```bash
    stripe listen --forward-to localhost:7866/billing/webhook
    ```
4.  **Get Webhook Secret**: The CLI will output a webhook secret (`whsec_...`). Copy this to your `.env` as `STRIPE_WEBHOOK_SECRET`.

## 5. Verification
1.  Restart the Backend API: `run_api.bat`.
2.  Open Studio -> Click Credit Balance (+).
3.  Select a Pack.
4.  Complete payment using Stripe Test Card (`4242 4242...`).
5.  Watch the `stripe listen` terminal for `200 OK`.
6.  Refresh Studio to see your new balance!
