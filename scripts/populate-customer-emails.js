#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Populate missing customer emails from recent guest orders.
// Usage: MONGODB_URI="..." node scripts/populate-customer-emails.js

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karachi-toy-shop';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const customers = db.collection('customers');
    const orders = db.collection('orders');

    const missing = await customers.find({ $or: [{ email: { $exists: false } }, { email: null }, { email: "" }] }).toArray();
    if (missing.length === 0) {
      console.log('No customers with missing email found.');
      process.exit(0);
    }

    console.log(`Found ${missing.length} customers with missing email. Processing...`);
    for (const c of missing) {
      const phone = c.phone || '';
      const phoneKey = c.phoneKey || (phone.replace(/\D/g, '').slice(-10) || '');
      // Find latest order matching phone or phoneKey
      const order = await orders.findOne({ $or: [{ 'customer.phone': { $regex: phoneKey + '$' } }, { 'customer.phone': phone }] }, { sort: { createdAt: -1 } });
      if (order && order.customer && order.customer.email) {
        const email = order.customer.email;
        // Ensure no other customer already has this email
        const existing = await customers.findOne({ email });
        if (existing) {
          console.log(`Skipping customer ${c._id}: email ${email} already used by ${existing._id}`);
          continue;
        }
        await customers.updateOne({ _id: c._id }, { $set: { email } });
        console.log(`Updated customer ${c._id} with email ${email}`);
      } else {
        console.log(`No recent order with email found for customer ${c._id}`);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  } finally {
    try { await client.close(); } catch {}
  }
})();
