import dns from "dns";
import mongoose from "mongoose";

// Windows/router DNS often fails Node's SRV lookup for mongodb+srv://
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // ignore if restricted
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI. Copy .env.example to .env.local and add your Atlas connection string."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
