import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  providers: [{ type: String }],
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error seeding admin: MONGODB_URI is not defined");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const email = "admin@radhikajewellers.com";
    const password = "Admin@123";

    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.providers = ['credentials'];
      await existingUser.save();
      console.log(`Admin user updated: ${email}`);
    } else {
      await User.create({
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: 'admin',
        providers: ['credentials']
      });
      console.log(`Admin user created: ${email}`);
    }

    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
