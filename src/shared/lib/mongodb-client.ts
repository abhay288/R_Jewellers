import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI.trim();
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise;

export default clientPromise;
