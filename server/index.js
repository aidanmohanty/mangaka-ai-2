
// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env file with the required variables.');
  process.exit(1);
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaka-ai')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);

// Secure file upload configurationconst storage = multer.diskStorage({  destination: (req, file, cb) => {    cb(null, "uploads/");  },  filename: (req, file, cb) => {    // Sanitize filename and add timestamp    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");    cb(null, Date.now() + "-" + sanitizedName);  }});// File filter for securityconst fileFilter = (req, file, cb) => {  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp").split(",");    if (allowedTypes.includes(file.mimetype)) {    cb(null, true);  } else {    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(", ")}`), false);  }};const upload = multer({   storage,  fileFilter,  limits: {    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024, // Default 10MB    files: 1 // Only allow 1 file per upload  }});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  });
};

// Multer error handling middlewareapp.use((error, req, res, next) => {  if (error instanceof multer.MulterError) {    if (error.code === "LIMIT_FILE_SIZE") {      return res.status(400).json({ error: "File too large. Maximum size: " + (process.env.MAX_FILE_SIZE_MB || 10) + "MB" });    }    if (error.code === "LIMIT_FILE_COUNT") {      return res.status(400).json({ error: "Too many files. Only 1 file allowed per upload." });    }    return res.status(400).json({ error: "File upload error: " + error.message });  }  if (error.message && error.message.includes("File type")) {    return res.status(400).json({ error: error.message });  }  next(error);});
app.post('/api/upload', authenticateToken, upload.single('manga'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check user quota
    if (!req.user.canProcess()) {
      return res.status(429).json({ 
        error: 'Processing quota exceeded. Please upgrade your plan.' 
      });
    }

    const filePath = req.file.path;
    const targetLanguage = req.body.targetLanguage || req.user.preferences.defaultLanguage;
    const enableColoring = req.body.enableColoring === 'true' || req.user.preferences.autoColoring;
    const coloringStyle = req.body.coloringStyle || req.user.preferences.coloringStyle;

    io.to(req.user._id.toString()).emit('processing_start', { 
      message: 'Processing started...' 
    });

    const response = await axios.post(`${AI_SERVICE_URL}/process`, {
      imagePath: filePath,
      targetLanguage,
      enableColoring,
      coloringStyle,
      textStyle: req.user.preferences.textStyle
    });

    // Update user usage and history
    await req.user.incrementUsage();
    req.user.processingHistory.push({
      originalImage: filePath,
      processedImage: response.data.outputPath,
      settings: {
        targetLanguage,
        enableColoring,
        coloringStyle
      }
    });
    await req.user.save();

    res.json({
      success: true,
      result: response.data,
      originalPath: filePath,
      quota: {
        used: req.user.subscription.used,
        total: req.user.subscription.processingQuota
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.post('/api/process-url', authenticateToken, async (req, res) => {
  try {
    const { url, targetLanguage, enableColoring, coloringStyle } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    // Check user quota
    if (!req.user.canProcess()) {
      return res.status(429).json({ 
        error: 'Processing quota exceeded. Please upgrade your plan.' 
      });
    }

    const finalTargetLanguage = targetLanguage || req.user.preferences.defaultLanguage;
    const finalEnableColoring = enableColoring !== undefined ? enableColoring : req.user.preferences.autoColoring;
    const finalColoringStyle = coloringStyle || req.user.preferences.coloringStyle;

    io.to(req.user._id.toString()).emit('processing_start', { 
      message: 'Downloading image...' 
    });

    const response = await axios.post(`${AI_SERVICE_URL}/process-url`, {
      url,
      targetLanguage: finalTargetLanguage,
      enableColoring: finalEnableColoring,
      coloringStyle: finalColoringStyle,
      textStyle: req.user.preferences.textStyle
    });

    // Update user usage and history
    await req.user.incrementUsage();
    req.user.processingHistory.push({
      originalImage: url,
      processedImage: response.data.outputPath,
      settings: {
        targetLanguage: finalTargetLanguage,
        enableColoring: finalEnableColoring,
        coloringStyle: finalColoringStyle
      }
    });
    await req.user.save();

    res.json({
      success: true,
      result: response.data,
      quota: {
        used: req.user.subscription.used,
        total: req.user.subscription.processingQuota
      }
    });

  } catch (error) {
    console.error('URL processing error:', error);
    res.status(500).json({ error: 'URL processing failed' });
  }
});

// Get user processing history
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('processingHistory');
    res.json(user.processingHistory.reverse()); // Most recent first
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Update user preferences
app.put('/api/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      $set: { preferences: { ...req.user.preferences, ...preferences } }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});