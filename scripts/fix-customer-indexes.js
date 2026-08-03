#!/usr/bin/env node
// Usage: MONGODB_URI="mongodb://..." node scripts/fix-customer-indexes.js
// This script checks for duplicate emails, drops the old unique phoneKey index (if present),
// and creates a unique index on `email` for the `customers` collection.

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karachi-toy-shop';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const coll = db.collection('customers');

    console.log('Current indexes:');
    console.log(await coll.indexes());

    console.log('Checking for duplicate emails...');
    const dups = await coll
      .aggregate([
        { $group: { _id: '$email', count: { $sum: 1 }, ids: { $push: '$_id' } } },
        { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
      ])
      .toArray();

    if (dups.length > 0) {
      console.error('Found duplicate emails. Resolve these before creating a unique index:');
      console.error(JSON.stringify(dups, null, 2));
      process.exit(1);
    }

    // Drop phoneKey unique index if it exists
    try {
      const idxs = await coll.indexes();
      const phoneIdx = idxs.find((i) => i.key && i.key.phoneKey === 1);
      if (phoneIdx) {
        console.log('Dropping index:', phoneIdx.name);
        await coll.dropIndex(phoneIdx.name);
        console.log('Dropped phoneKey index');
      } else {
        console.log('No phoneKey index found; nothing to drop');
      }
    } catch (e) {
      console.error('Error dropping phoneKey index:', e.message);
    }

    // Ensure unique email index
    try {
      console.log('Creating unique index on email...');
      await coll.createIndex({ email: 1 }, { unique: true, background: true });
      console.log('Unique index on email created');
    } catch (e) {
      console.error('Failed to create unique email index:', e.message);
      process.exit(1);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(2);
  } finally {
    try {
      await client.close();
    } catch {}
  }
})();
