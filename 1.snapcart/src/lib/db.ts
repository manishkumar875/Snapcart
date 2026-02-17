import mongoose from "mongoose"

const MONGODB_URL = process.env.MONGODB_URL!

if (!MONGODB_URL) {
  throw new Error("Please define the MONGODB_URL environment variable")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global cache (for hot reload in Next.js)
declare global {
  var mongoose: MongooseCache | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected")
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
    return cached!.conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    cached!.promise = null
    throw error
  }
}

export default connectDb
