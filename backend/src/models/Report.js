const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - location
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: Уникальный идентификатор жалобы
 *         title:
 *           type: string
 *           description: Заголовок жалобы
 *         description:
 *           type: string
 *           description: Описание проблемы
 *         category:
 *           type: string
 *           enum: [road, lighting, waste, park, building, water, transport, other]
 *           description: Категория проблемы
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           default: medium
 *           description: Приоритет жалобы
 *         status:
 *           type: string
 *           enum: [new, in_progress, resolved, rejected]
 *           default: new
 *           description: Статус жалобы
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
 *           description: Адрес проблемы
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               publicId:
 *                 type: string
 *               caption:
 *                 type: string
 *         user:
 *           type: string
 *           description: ID пользователя, подавшего жалобу
 *         isAnonymous:
 *           type: boolean
 *           default: false
 *           description: Анонимная ли жалоба
 *         assignedTo:
 *           type: string
 *           description: ID ответственного сотрудника
 *         estimatedResolutionDate:
 *           type: string
 *           format: date-time
 *           description: Предполагаемая дата решения
 *         actualResolutionDate:
 *           type: string
 *           format: date-time
 *           description: Фактическая дата решения
 *         resolutionNotes:
 *           type: string
 *           description: Заметки о решении
 *         votes:
 *           type: object
 *           properties:
 *             up:
 *               type: number
 *               default: 0
 *             down:
 *               type: number
 *               default: 0
 *             users:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                   vote:
 *                     type: string
 *                     enum: [up, down]
 *         viewCount:
 *           type: number
 *           default: 0
 *           description: Количество просмотров
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Теги для поиска
 *         metadata:
 *           type: object
 *           properties:
 *             deviceInfo:
 *               type: string
 *             appVersion:
 *               type: string
 *             submissionMethod:
 *               type: string
 *               enum: [mobile, web]
 *               default: mobile
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Время создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Время последнего обновления
 */

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Заголовок обязателен'],
    trim: true,
    maxlength: [config.validation.maxTitleLength, `Заголовок не должен превышать ${config.validation.maxTitleLength} символов`],
  },
  description: {
    type: String,
    required: [true, 'Описание обязательно'],
    trim: true,
    minlength: [config.validation.minDescriptionLength, `Описание должно содержать минимум ${config.validation.minDescriptionLength} символов`],
    maxlength: [config.validation.maxDescriptionLength, `Описание не должно превышать ${config.validation.maxDescriptionLength} символов`],
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    enum: {
      values: config.constants.reportCategories,
      message: 'Некорректная категория',
    },
  },
  priority: {
    type: String,
    enum: {
      values: config.constants.reportPriorities,
      message: 'Некорректный приоритет',
    },
    default: 'medium',
  },
  status: {
    type: String,
    enum: {
      values: config.constants.reportStatuses,
      message: 'Некорректный статус',
    },
    default: 'new',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Координаты обязательны'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Некорректные координаты',
      },
    },
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Адрес не должен превышать 200 символов'],
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      maxlength: [100, 'Подпись не должна превышать 100 символов'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Пользователь обязателен'],
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  estimatedResolutionDate: {
    type: Date,
    default: null,
  },
  actualResolutionDate: {
    type: Date,
    default: null,
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Заметки о решении не должны превышать 500 символов'],
  },
  votes: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      vote: {
        type: String,
        enum: ['up', 'down'],
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Тег не должен превышать 20 символов'],
  }],
  metadata: {
    deviceInfo: String,
    appVersion: String,
    submissionMethod: {
      type: String,
      enum: ['mobile', 'web'],
      default: 'mobile',
    },
    ipAddress: String,
    userAgent: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ user: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ assignedTo: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ 'votes.up': -1 });

// Compound indexes
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ location: '2dsphere', category: 1 });

// Virtual for comments
reportSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'report',
});

// Virtual for total votes
reportSchema.virtual('totalVotes').get(function() {
  return this.votes.up - this.votes.down;
});

// Virtual for vote percentage
reportSchema.virtual('votePercentage').get(function() {
  const total = this.votes.up + this.votes.down;
  return total > 0 ? Math.round((this.votes.up / total) * 100) : 0;
});

// Virtual for days since creation
reportSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time (in days)
reportSchema.virtual('resolutionTime').get(function() {
  if (this.actualResolutionDate) {
    return Math.floor((this.actualResolutionDate - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware
reportSchema.pre('save', function(next) {
  // Auto-resolve if resolution date is set
  if (this.actualResolutionDate && this.status !== 'resolved') {
    this.status = 'resolved';
  }
  
  // Set estimated resolution date based on priority
  if (this.isNew && !this.estimatedResolutionDate) {
    const days = {
      critical: 1,
      high: 3,
      medium: 7,
      low: 14,
    };
    
    this.estimatedResolutionDate = new Date(
      Date.now() + days[this.priority] * 24 * 60 * 60 * 1000
    );
  }
  
  next();
});

// Method to add vote
reportSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote from this user
  this.votes.users = this.votes.users.filter(v => !v.user.equals(userId));
  
  // Add new vote
  this.votes.users.push({
    user: userId,
    vote: voteType,
  });
  
  // Recalculate vote counts
  this.votes.up = this.votes.users.filter(v => v.vote === 'up').length;
  this.votes.down = this.votes.users.filter(v => v.vote === 'down').length;
};

// Method to remove vote
reportSchema.methods.removeVote = function(userId) {
  this.votes.users = this.votes.users.filter(v => !v.user.equals(userId));
  
  // Recalculate vote counts
  this.votes.up = this.votes.users.filter(v => v.vote === 'up').length;
  this.votes.down = this.votes.users.filter(v => v.vote === 'down').length;
};

// Method to get user's vote
reportSchema.methods.getUserVote = function(userId) {
  const userVote = this.votes.users.find(v => v.user.equals(userId));
  return userVote ? userVote.vote : null;
};

// Method to increment view count
reportSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to find reports by location
reportSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 5000) {
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
  });
};

// Static method to find reports by category and status
reportSchema.statics.findByCategoryAndStatus = function(category, status) {
  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get statistics
reportSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$actualResolutionDate', null] },
              { $divide: [{ $subtract: ['$actualResolutionDate', '$createdAt'] }, 1000 * 60 * 60 * 24] },
              null,
            ],
          },
        },
      },
    },
  ]);
};

module.exports = mongoose.model('Report', reportSchema);
