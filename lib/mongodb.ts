import { setServers } from "node:dns";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || "konkoorbaz";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

if (process.platform === "win32" && MONGODB_URI.startsWith("mongodb+srv://")) {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: MONGODB_DB,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
