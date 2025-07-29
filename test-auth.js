// Quick test to verify auth logic without database
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Mock user for testing
const mockUser = {
  _id: '64f5a1b2c3d4e5f6789abc01',
  username: 'testuser',
  email: 'test@example.com',
  password: '$2a$10$hashedpassword', // bcrypt hash of 'password123'
  preferences: {
    defaultLanguage: 'en',
    autoColoring: false,
    coloringStyle: 'anime',
    textStyle: { fontSize: 'medium', fontFamily: 'Arial' }
  },
  subscription: {
    type: 'free',
    processingQuota: 10,
    used: 0
  }
};

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  if (email === 'test@example.com' && password === 'password123') {
    const token = jwt.sign(
      { userId: mockUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    const userData = {
      id: mockUser._id.toString(),
      username: mockUser.username,
      email: mockUser.email,
      preferences: mockUser.preferences,
      subscription: mockUser.subscription
    };

    console.log('Login successful, returning:', userData);

    res.json({
      token,
      user: userData
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

// Test /me endpoint
app.get('/api/auth/me', (req, res) => {
  const userData = {
    id: mockUser._id.toString(),
    username: mockUser.username,
    email: mockUser.email,
    preferences: mockUser.preferences,
    subscription: mockUser.subscription
  };

  console.log('Returning user data:', userData);
  res.json(userData);
});

app.listen(5003, () => {
  console.log('🧪 Test auth server running on port 5003');
  console.log('📧 Test credentials: test@example.com / password123');
});