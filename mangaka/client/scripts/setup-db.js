const mongoose = require('mongoose');
const User = require('../server/models/User');

async function setupDatabase() {
  try {
    // Connect to MongoDB Atlas
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaka-ai';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // User collection indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ 'subscription.type': 1 });
    
    console.log('✅ Database indexes created');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@mangaka.ai' });
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@mangaka.ai',
        password: 'admin123', // Will be hashed automatically
        subscription: {
          type: 'pro',
          processingQuota: 99999,
          used: 0
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created: admin@mangaka.ai / admin123');
    }

    console.log('🎉 Database setup complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();