require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Simple raw schema to bypass any Next.js specific model issues in standalone script
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
    }, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const adminEmail = 'admin@radhikajewellers.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists! You can log in with:');
      console.log('Email:', adminEmail);
      console.log('Password:', 'Admin@123'); // Assuming default
    } else {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      });
      console.log('Successfully created Admin user!');
      console.log('Email:', adminEmail);
      console.log('Password: Admin@123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
