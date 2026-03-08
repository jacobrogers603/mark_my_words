import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const uri = process.env.DATABASE_URL;

type GlobalMongo = typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongo;

const client = globalMongo.mongoClient || new MongoClient(uri);
const clientPromise = globalMongo.mongoClientPromise || client.connect();

if (process.env.NODE_ENV !== "production") {
  globalMongo.mongoClient = client;
  globalMongo.mongoClientPromise = clientPromise;
}

export const getMongoDb = async () => {
  const connectedClient = await clientPromise;
  return connectedClient.db();
};
