const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         _id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Пароль пользователя
 *         firstName:
 *           type: string
 *           description: Имя пользователя
 *         lastName:
 *           type: string
 *           description: Фамилия пользователя
 *         phone:
 *           type: string
 *           description: Номер телефона
 *         avatar:
 *           type: string
 *           description: URL аватара пользователя
 *         role:
 *           type: string
 *           enum: [user, volunteer, moderator, admin]
 *           default: user
 *           description: Роль пользователя
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Активен ли пользователь
 *         isEmailVerified:
 *           type: boolean
 *           default: false
 *           description: Подтвержден ли email
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               default: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               minItems: 2
 *               maxItems: 2
 *               description: [longitude, latitude]
 *         address:
 *           type: string
 *           description: Адрес пользователя
 *         preferences:
 *           type: object
 *           properties:
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                   default: true
 *                 push:
 *                   type: boolean
 *                   default: true
 *                 sms:
 *                   type: boolean
 *                   default: false
 *             language:
 *               type: string
 *               enum: [ru, ky, en]
 *               default: ru
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *               default: auto
 *         stats:
 *           type: object
 *           properties:
 *             reportsSubmitted:
 *               type: number
 *               default: 0
 *             reportsResolved:
 *               type: number
 *               default: 0
 *             volunteerHours:
 *               type: number
 *               default: 0
 *             tasksCompleted:
 *               type: number
 *               default: 0
 *             rating:
 *               type: number
 *               default: 0
 *               min: 0
 *               max: 5
 *         fcmTokens:
 *           type: array
 *           items:
 *             type: string
 *           description: Firebase Cloud Messaging токены
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Время последнего входа
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Время создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Время последнего обновления
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный email'],
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    select: false,
  },
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
    maxlength: [50, 'Имя не должно превышать 50 символов'],
  },
  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true,
    maxlength: [50, 'Фамилия не должна превышать 50 символов'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Некорректный номер телефона'],
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: config.constants.userRoles,
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [74.5698, 42.8746], // Bishkek coordinates
    },
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Адрес не должен превышать 200 символов'],
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    language: {
      type: String,
      enum: ['ru', 'ky', 'en'],
      default: 'ru',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  stats: {
    reportsSubmitted: { type: Number, default: 0 },
    reportsResolved: { type: Number, default: 0 },
    volunteerHours: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  fcmTokens: [{
    type: String,
  }],
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for reports
userSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'user',
});

// Virtual for volunteer tasks
userSchema.virtual('volunteerTasks', {
  ref: 'VolunteerTask',
  localField: '_id',
  foreignField: 'volunteer',
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Method to add FCM token
userSchema.methods.addFCMToken = function(token) {
  if (!this.fcmTokens.includes(token)) {
    this.fcmTokens.push(token);
  }
};

// Method to remove FCM token
userSchema.methods.removeFCMToken = function(token) {
  this.fcmTokens = this.fcmTokens.filter(t => t !== token);
};

// Method to update stats
userSchema.methods.updateStats = function(statType, increment = 1) {
  if (this.stats[statType] !== undefined) {
    this.stats[statType] += increment;
  }
};

// Static method to find users by location
userSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    isActive: true,
  });
};

// Static method to find volunteers
userSchema.statics.findVolunteers = function() {
  return this.find({
    role: { $in: ['volunteer', 'moderator', 'admin'] },
    isActive: true,
  });
};

module.exports = mongoose.model('User', userSchema);
