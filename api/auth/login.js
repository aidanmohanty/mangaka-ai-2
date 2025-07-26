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
      const { email, password } = req.body;

      const db = await connectToDatabase();
      const users = db.collection('users');

      // Find user by email
      const user = await users.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };