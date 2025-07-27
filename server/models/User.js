const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    trim: true
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
    }
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
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform toJSON to remove password and add id field
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  userObject.id = userObject._id;
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);