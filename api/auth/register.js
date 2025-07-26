 const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { MongoClient } = require('mongodb');

  let cachedDb = null;

  async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    cachedDb = client.db('mangaka-ai');
    return cachedDb;
  }

  module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { username, email, password } = req.body;

      const db = await connectToDatabase();
      const users = db.collection('users');

      // Check if user exists
      const existingUser = await users.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.insertedId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { username, email }
      });

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const user = await users.insertOne({
    username,
    email,
    password: hashedPassword,
    subscription: {
      used: 0,
      processingQuota: 100,
      tier: 'free'
    },
    createdAt: new Date()
  });