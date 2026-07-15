import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log("✅ Successfully connected to MongoDB!");
    
    // Check if we can query
    const db = mongoose.connection.db;
    if (db) {
        const collections = await db.listCollections().toArray();
        console.log(`Database has ${collections.length} collections.`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(error.message);
    process.exit(1);
  }
}

checkConnection();
