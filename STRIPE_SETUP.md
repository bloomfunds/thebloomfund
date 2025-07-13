# Stripe Payment Integration Setup Guide

## Overview
This guide will help you set up Stripe payments for the Bloom crowdfunding platform. The platform uses Stripe Checkout for secure payment processing and Stripe Connect for payouts to campaign creators.

## Prerequisites
1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. The Bloom platform codebase

## Step 1: Stripe Account Setup

### 1.1 Create a Stripe Account
1. Go to https://stripe.com and create an account
2. Complete the account verification process
3. Note your API keys from the Dashboard

### 1.2 Get Your API Keys
1. In your Stripe Dashboard, go to Developers > API keys
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the test keys (start with `pk_test_` and `sk_test_`)
4. For production, use the live keys (start with `pk_live_` and `sk_live_`)

## Step 2: Environment Variables Setup

### 2.1 Create Environment File
Create a `.env.local` file in your project root:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Webhook Secret (will be generated in next step)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2.2 Production Environment Variables
For production deployment, set these environment variables in your hosting platform:

```bash
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Production Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

## Step 3: Webhook Configuration

### 3.1 Set Up Webhook Endpoint
1. In your Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL:
   - Development: `http://localhost:3000/api/webhooks/stripe`
   - Production: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
   - `transfer.failed`
5. Click "Add endpoint"
6. Copy the webhook signing secret and add it to your environment variables

### 3.2 Test Webhook
1. In the webhook details page, click "Send test webhook"
2. Select `checkout.session.completed` event
3. Send the test webhook
4. Check your application logs to ensure the webhook is received

## Step 4: Stripe Connect Setup (for Payouts)

### 4.1 Enable Stripe Connect
1. In your Stripe Dashboard, go to Connect > Settings
2. Enable Stripe Connect if not already enabled
3. Configure your Connect settings:
   - Business type: Individual or Company
   - Country: Your country
   - Currency: USD (or your preferred currency)

### 4.2 Configure Connect Settings
1. Set up your Connect branding
2. Configure payout schedules
3. Set up verification requirements

## Step 5: Testing the Payment Flow

### 5.1 Test Card Numbers
Use these test card numbers for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### 5.2 Test the Complete Flow
1. Start your development server: `npm run dev`
2. Create a test campaign
3. Try making a donation using a test card
4. Verify the payment is processed and campaign funding is updated
5. Check that the webhook is triggered and payment is recorded

## Step 6: Production Deployment

### 6.1 Switch to Live Keys
1. Replace test keys with live keys in your environment variables
2. Update webhook endpoint to production URL
3. Test with a small real payment

### 6.2 Security Considerations
1. Never commit API keys to version control
2. Use environment variables for all sensitive data
3. Enable webhook signature verification
4. Monitor webhook events in Stripe Dashboard

## Troubleshooting

### Common Issues

1. **"Stripe is not properly configured" error**
   - Check that `STRIPE_SECRET_KEY` is set correctly
   - Ensure the key is not the dummy value

2. **Webhook not receiving events**
   - Verify webhook endpoint URL is correct
   - Check webhook secret is set correctly
   - Ensure your server is accessible from the internet

3. **Payment not updating campaign funding**
   - Check webhook is being received
   - Verify database connection
   - Check payment creation function

4. **Checkout session not redirecting**
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Check success/cancel URLs are correct

### Debug Mode
Enable debug logging by adding to your environment:

```bash
DEBUG=stripe:*
```

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For platform-specific issues:
- Check the application logs
- Review webhook event logs in Stripe Dashboard
- Verify database connections and permissions

## Security Best Practices

1. **API Key Security**
   - Use environment variables
   - Rotate keys regularly
   - Use different keys for test/production

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS in production
   - Monitor webhook events

3. **Data Protection**
   - Never log sensitive payment data
   - Use PCI-compliant practices
   - Follow GDPR requirements

4. **Error Handling**
   - Implement proper error handling
   - Log errors without sensitive data
   - Provide user-friendly error messages 