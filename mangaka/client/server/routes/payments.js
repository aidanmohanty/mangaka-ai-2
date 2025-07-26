const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  premium: {
    price: 999, // $9.99 in cents
    quota: 100,
    features: ['Advanced translation', 'AI colorization', 'HD quality', 'Priority support']
  },
  pro: {
    price: 2999, // $29.99 in cents
    quota: 999999,
    features: ['Unlimited pages', 'Professional translation', '4K quality', 'Custom styles', 'API access', '24/7 support']
  }
};

// Create subscription checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mangaka.ai ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Monthly subscription with ${SUBSCRIPTION_PLANS[plan].quota === 999999 ? 'unlimited' : SUBSCRIPTION_PLANS[plan].quota} manga pages`,
            },
            unit_amount: SUBSCRIPTION_PLANS[plan].price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/settings`,
      client_reference_id: req.user._id.toString(),
      metadata: {
        userId: req.user._id.toString(),
        plan: plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful subscription
router.post('/subscription-success', authenticateToken, async (req, res) => {
  try {
    const { session_id } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.client_reference_id === req.user._id.toString()) {
      const plan = session.metadata.plan;
      
      // Update user subscription
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'subscription.type': plan,
          'subscription.processingQuota': SUBSCRIPTION_PLANS[plan].quota,
          'subscription.used': 0,
          'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      res.json({ success: true, plan });
    } else {
      res.status(400).json({ error: 'Invalid session' });
    }
  } catch (error) {
    console.error('Subscription success error:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Find the subscription in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active'
    });

    if (subscriptions.data.length > 0) {
      await stripe.subscriptions.del(subscriptions.data[0].id);
      
      // Update user to free plan
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'subscription.type': 'free',
          'subscription.processingQuota': 10,
          'subscription.used': 0,
          'subscription.expiresAt': null
        }
      });

      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'No active subscription found' });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get billing history
router.get('/billing-history', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 10
    });

    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      description: invoice.lines.data[0]?.description || 'Subscription payment',
      receipt_url: invoice.receipt_url
    }));

    res.json({ invoices: billingHistory });
  } catch (error) {
    console.error('Billing history error:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        
        // Update user subscription
        await User.findByIdAndUpdate(userId, {
          $set: {
            'subscription.type': plan,
            'subscription.processingQuota': SUBSCRIPTION_PLANS[plan].quota,
            'subscription.used': 0,
            'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            stripeCustomerId: session.customer
          }
        });
        break;

      case 'invoice.payment_succeeded':
        // Handle successful recurring payment
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        
        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
          // Extend subscription for another month
          const newExpiryDate = new Date(user.subscription.expiresAt || Date.now());
          newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
          
          await User.findByIdAndUpdate(user._id, {
            $set: {
              'subscription.expiresAt': newExpiryDate,
              'subscription.used': 0 // Reset monthly usage
            }
          });
        }
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const subscription = event.data.object;
        const cancelledUser = await User.findOne({ stripeCustomerId: subscription.customer });
        
        if (cancelledUser) {
          await User.findByIdAndUpdate(cancelledUser._id, {
            $set: {
              'subscription.type': 'free',
              'subscription.processingQuota': 10,
              'subscription.used': 0,
              'subscription.expiresAt': null
            }
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;