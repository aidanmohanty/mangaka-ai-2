const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const processingHistorySchema = new mongoose.Schema({
  originalImage: {
    type: String,
    required: true
  },
  processedImage: {
    type: String,
    required: true
  },
  settings: {
    targetLanguage: { type: String, default: 'en' },
    enableColoring: { type: Boolean, default: false },
    coloringStyle: { type: String, default: 'vibrant' },
    textStyle: { type: String, default: 'comic' }
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  textAreasDetected: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    autoColoring: {
      type: Boolean,
      default: false
    },
    coloringStyle: {
      type: String,
      enum: ['vibrant', 'pastel', 'dark', 'natural', 'anime'],
      default: 'anime'
    },
    textStyle: {
      fontSize: {
        type: String,
        default: 'medium'
      },
      fontFamily: {
        type: String,
        default: 'Arial'
      }
    }
  },
  subscription: {
    type: {
      type: String,
      default: 'free',
      enum: ['free', 'premium', 'pro']
    },
    processingQuota: {
      type: Number,
      default: 10
    },
    used: {
      type: Number,
      default: 0
    },
    renewsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  processingHistory: [processingHistorySchema],
  // Rate limiting fields
  lastProcessingRequest: Date,
  processingRequestCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Check if user can process more images
userSchema.methods.canProcess = function() {
  // Check subscription quota
  if (this.subscription.used >= this.subscription.processingQuota) {
    return false;
  }
  
  // Check if subscription is active
  if (this.subscription.renewsAt && this.subscription.renewsAt < new Date()) {
    return false;
  }
  
  // Rate limiting check (max 5 requests per minute for free users)
  if (this.subscription.type === 'free') {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    if (this.lastProcessingRequest && this.lastProcessingRequest > oneMinuteAgo) {
      if (this.processingRequestCount >= 5) {
        return false;
      }
    }
  }
  
  return true;
};

// Increment usage counter
userSchema.methods.incrementUsage = async function() {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  // Reset rate limiting counter if needed
  if (!this.lastProcessingRequest || this.lastProcessingRequest < oneMinuteAgo) {
    this.processingRequestCount = 0;
  }
  
  // Increment counters
  this.subscription.used += 1;
  this.processingRequestCount += 1;
  this.lastProcessingRequest = now;
  
  return this.save();
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = function() {
  this.subscription.used = 0;
  this.subscription.renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Transform toJSON to remove password and add id field
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  userObject.id = userObject._id;
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);