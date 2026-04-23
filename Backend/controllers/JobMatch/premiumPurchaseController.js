import PremiumPurchase from '../../models/JobMatch/PremiumPurchase.js';
import crypto from 'crypto';

const PREMIUM_PRICE = 1499; // LKR
const CURRENCY = 'LKR';

// ── GET /api/job-match/premium/status ────────────────────────────────────────
// Returns whether the authenticated user has an active premium purchase.
export const getPremiumStatus = async (req, res) => {
  try {
    const userId = String(req.user?.id || '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const purchase = await PremiumPurchase.findOne({ userId, status: 'completed' });
    res.json({ isPremium: Boolean(purchase), purchase: purchase || null });
  } catch (error) {
    res.status(500).json({ message: 'Error checking premium status', error: error.message });
  }
};

// ── POST /api/job-match/premium/purchase ─────────────────────────────────────
// Simulates a card payment and creates a completed purchase record.
// Accepts: { cardHolder, cardNumber, expiryMonth, expiryYear, cvv }
export const purchasePremium = async (req, res) => {
  try {
    const userId = String(req.user?.id || '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Block duplicate purchases
    const existing = await PremiumPurchase.findOne({ userId, status: 'completed' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active premium subscription.' });
    }

    const { cardHolder, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    // ── Basic card validation ──────────────────────────────────────────────
    const errors = {};

    const cleanHolder = String(cardHolder || '').trim();
    if (!cleanHolder || cleanHolder.length < 2) {
      errors.cardHolder = 'Cardholder name is required.';
    }

    const cleanNumber = String(cardNumber || '').replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) {
      errors.cardNumber = 'Enter a valid 16-digit card number.';
    }

    const month = Number(expiryMonth);
    const year = Number(expiryYear);
    const now = new Date();
    if (!month || month < 1 || month > 12) {
      errors.expiryMonth = 'Enter a valid expiry month (01–12).';
    } else if (!year || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiryYear = 'Card has expired.';
    }

    const cleanCvv = String(cvv || '').trim();
    if (!/^\d{3,4}$/.test(cleanCvv)) {
      errors.cvv = 'Enter a valid CVV (3 or 4 digits).';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Card validation failed.', errors });
    }

    // ── Simulate processing delay (already handled client-side) ───────────
    // Generate a transaction reference
    const transactionRef = `CB-PREM-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const cardLast4 = cleanNumber.slice(-4);

    const purchase = await PremiumPurchase.create({
      userId,
      plan: 'premium_templates',
      amount: PREMIUM_PRICE,
      currency: CURRENCY,
      status: 'completed',
      cardLast4,
      cardHolder: cleanHolder,
      transactionRef,
      completedAt: new Date(),
    });

    res.status(201).json({
      message: 'Payment successful. Premium templates unlocked!',
      transactionRef: purchase.transactionRef,
      cardLast4: purchase.cardLast4,
      amount: purchase.amount,
      currency: purchase.currency,
      completedAt: purchase.completedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error. Please try again.', error: error.message });
  }
};

// ── GET /api/job-match/premium/history (admin) ───────────────────────────────
export const getPurchaseHistory = async (req, res) => {
  try {
    const purchases = await PremiumPurchase.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ total: purchases.length, purchases });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase history', error: error.message });
  }
};
