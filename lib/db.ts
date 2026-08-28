import mongoose from 'mongoose';
import { env } from '@/lib/config';

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: env.MONGODB_DB,
      // M0 free tier shares ~500 connections across all free clusters.
      // Keep pool small so concurrent lambdas don't exhaust the cap.
      maxPoolSize: 3,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { dbConnect, dbConnect as connectDB };
export default dbConnect;

// Expose underlying mongo client for better-auth
export function getMongoClient() {
  if (!cached.conn) {
    throw new Error('Database not connected. Call dbConnect() first or ensure it is called before getMongoClient()');
  }
  return mongoose.connection.getClient();
}
