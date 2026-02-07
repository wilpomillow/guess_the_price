import "server-only"
import { MongoClient } from "mongodb"

const dbName = process.env.MONGODB_DB || "guess_the_price"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI env var. Set it in .env.local and in Vercel Environment Variables."
    )
  }
  return uri
}

export async function getDb() {
  const uri = getMongoUri() // ✅ now typed as string

  if (!global.__mongoClient) {
    global.__mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000
    })
  }

  await global.__mongoClient.connect()
  return global.__mongoClient.db(dbName)
}
