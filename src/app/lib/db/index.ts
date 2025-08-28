// lib/db.ts
import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

interface CachedDB {
  conn: Connection | typeof mongoose | null;
  promise: Promise<Connection | typeof mongoose> | null;
}

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable");
}

let cached = ((global as unknown as { mongoose: CachedDB }).mongoose || {
  conn: null,
  promise: null,
}) as CachedDB;

if (!cached) {
  cached = (global as unknown as { mongoose: CachedDB }).mongoose = {
    conn: null,
    promise: null,
  } as CachedDB;
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
