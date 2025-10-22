const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * @swagger
 * components:
 *   schemas:
 *     VolunteerTask:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - taskType
 *         - location
 *         - organizer
 *         - scheduledDate
 *       properties:
 *         _id:
 *           type: string
 *           description: Уникальный идентификатор задачи
 *         title:
 *           type: string
 *           description: Название задачи
 *         description:
 *           type: string
 *           description: Описание задачи
 *         taskType:
 *           type: string
 *           enum: [cleaning, repair, painting, planting, monitoring, education, other]
 *           description: Тип задачи
 *         status:
 *           type: string
 *           enum: [active, pending, completed, cancelled]
 *           default: active
 *           description: Статус задачи
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
 *           description: Адрес задачи
 *         organizer:
 *           type: string
 *           description: ID организатора задачи
 *         volunteers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [registered, confirmed, completed, cancelled]
 *               registeredAt:
 *                 type: string
 *                 format: date-time
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *               hoursWorked:
 *                 type: number
 *               rating:
 *                 type: number
 *                 min: 1
 *                 max: 5
 *               feedback:
 *                 type: string
 *         maxVolunteers:
 *           type: number
 *           default: 10
 *           description: Максимальное количество волонтеров
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           description: Запланированная дата выполнения
 *         estimatedDuration:
 *           type: number
 *           description: Предполагаемая продолжительность в часах
 *         actualStartTime:
 *           type: string
 *           format: date-time
 *           description: Фактическое время начала
 *         actualEndTime:
 *           type: string
 *           format: date-time
 *           description: Фактическое время окончания
 *         requirements:
 *           type: object
 *           properties:
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *             equipment:
 *               type: array
 *               items:
 *                 type: string
 *             minAge:
 *               type: number
 *               default: 16
 *             physicalDemand:
 *               type: string
 *               enum: [low, medium, high]
 *               default: medium
 *         rewards:
 *           type: object
 *           properties:
 *             points:
 *               type: number
 *               default: 0
 *             certificates:
 *               type: boolean
 *               default: false
 *             meals:
 *               type: boolean
 *               default: false
 *             transport:
 *               type: boolean
 *               default: false
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
 *         relatedReport:
 *           type: string
 *           description: ID связанной жалобы
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Теги для поиска
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Время создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Время последнего обновления
 */

const volunteerTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название задачи обязательно'],
    trim: true,
    maxlength: [config.validation.maxTitleLength, `Название не должно превышать ${config.validation.maxTitleLength} символов`],
  },
  description: {
    type: String,
    required: [true, 'Описание задачи обязательно'],
    trim: true,
    minlength: [config.validation.minDescriptionLength, `Описание должно содержать минимум ${config.validation.minDescriptionLength} символов`],
    maxlength: [config.validation.maxDescriptionLength, `Описание не должно превышать ${config.validation.maxDescriptionLength} символов`],
  },
  taskType: {
    type: String,
    required: [true, 'Тип задачи обязателен'],
    enum: {
      values: config.constants.volunteerTaskTypes,
      message: 'Некорректный тип задачи',
    },
  },
  status: {
    type: String,
    enum: {
      values: config.constants.volunteerStatuses,
      message: 'Некорректный статус',
    },
    default: 'active',
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
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Организатор обязателен'],
  },
  volunteers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'completed', 'cancelled'],
      default: 'registered',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    hoursWorked: {
      type: Number,
      default: 0,
      min: [0, 'Часы работы не могут быть отрицательными'],
    },
    rating: {
      type: Number,
      min: [1, 'Рейтинг не может быть меньше 1'],
      max: [5, 'Рейтинг не может быть больше 5'],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Отзыв не должен превышать 500 символов'],
    },
  }],
  maxVolunteers: {
    type: Number,
    default: 10,
    min: [1, 'Минимальное количество волонтеров - 1'],
    max: [100, 'Максимальное количество волонтеров - 100'],
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Запланированная дата обязательна'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Запланированная дата должна быть в будущем',
    },
  },
  estimatedDuration: {
    type: Number,
    min: [0.5, 'Минимальная продолжительность - 0.5 часа'],
    max: [24, 'Максимальная продолжительность - 24 часа'],
    default: 2,
  },
  actualStartTime: {
    type: Date,
    default: null,
  },
  actualEndTime: {
    type: Date,
    default: null,
  },
  requirements: {
    skills: [{
      type: String,
      trim: true,
      maxlength: [50, 'Навык не должен превышать 50 символов'],
    }],
    equipment: [{
      type: String,
      trim: true,
      maxlength: [50, 'Оборудование не должно превышать 50 символов'],
    }],
    minAge: {
      type: Number,
      default: 16,
      min: [12, 'Минимальный возраст - 12 лет'],
      max: [80, 'Максимальный возраст - 80 лет'],
    },
    physicalDemand: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  rewards: {
    points: {
      type: Number,
      default: 0,
      min: [0, 'Баллы не могут быть отрицательными'],
    },
    certificates: {
      type: Boolean,
      default: false,
    },
    meals: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: Boolean,
      default: false,
    },
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
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Тег не должен превышать 20 символов'],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
volunteerTaskSchema.index({ location: '2dsphere' });
volunteerTaskSchema.index({ organizer: 1 });
volunteerTaskSchema.index({ taskType: 1 });
volunteerTaskSchema.index({ status: 1 });
volunteerTaskSchema.index({ scheduledDate: 1 });
volunteerTaskSchema.index({ createdAt: -1 });
volunteerTaskSchema.index({ tags: 1 });
volunteerTaskSchema.index({ 'volunteers.user': 1 });

// Compound indexes
volunteerTaskSchema.index({ taskType: 1, status: 1 });
volunteerTaskSchema.index({ location: '2dsphere', taskType: 1 });
volunteerTaskSchema.index({ scheduledDate: 1, status: 1 });

// Virtual for registered volunteers count
volunteerTaskSchema.virtual('registeredVolunteersCount').get(function() {
  return this.volunteers.filter(v => v.status === 'registered').length;
});

// Virtual for confirmed volunteers count
volunteerTaskSchema.virtual('confirmedVolunteersCount').get(function() {
  return this.volunteers.filter(v => v.status === 'confirmed').length;
});

// Virtual for completed volunteers count
volunteerTaskSchema.virtual('completedVolunteersCount').get(function() {
  return this.volunteers.filter(v => v.status === 'completed').length;
});

// Virtual for available spots
volunteerTaskSchema.virtual('availableSpots').get(function() {
  return this.maxVolunteers - this.registeredVolunteersCount;
});

// Virtual for is full
volunteerTaskSchema.virtual('isFull').get(function() {
  return this.registeredVolunteersCount >= this.maxVolunteers;
});

// Virtual for total hours worked
volunteerTaskSchema.virtual('totalHoursWorked').get(function() {
  return this.volunteers.reduce((total, volunteer) => total + (volunteer.hoursWorked || 0), 0);
});

// Virtual for average rating
volunteerTaskSchema.virtual('averageRating').get(function() {
  const ratings = this.volunteers.filter(v => v.rating).map(v => v.rating);
  return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
});

// Virtual for actual duration
volunteerTaskSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return (this.actualEndTime - this.actualStartTime) / (1000 * 60 * 60); // in hours
  }
  return null;
});

// Virtual for days until scheduled date
volunteerTaskSchema.virtual('daysUntilScheduled').get(function() {
  return Math.ceil((this.scheduledDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
volunteerTaskSchema.pre('save', function(next) {
  // Auto-complete task if end time is set
  if (this.actualEndTime && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  // Calculate points based on duration and type
  if (this.isNew && this.rewards.points === 0) {
    const basePoints = {
      cleaning: 10,
      repair: 15,
      painting: 12,
      planting: 8,
      monitoring: 6,
      education: 20,
      other: 10,
    };
    
    this.rewards.points = basePoints[this.taskType] * (this.estimatedDuration || 2);
  }
  
  next();
});

// Method to register volunteer
volunteerTaskSchema.methods.registerVolunteer = function(userId) {
  // Check if already registered
  const existingVolunteer = this.volunteers.find(v => v.user.equals(userId));
  if (existingVolunteer) {
    throw new Error('Волонтер уже зарегистрирован на эту задачу');
  }
  
  // Check if task is full
  if (this.isFull) {
    throw new Error('Задача заполнена');
  }
  
  // Check if task is still active
  if (this.status !== 'active') {
    throw new Error('Задача недоступна для регистрации');
  }
  
  this.volunteers.push({
    user: userId,
    status: 'registered',
  });
};

// Method to confirm volunteer
volunteerTaskSchema.methods.confirmVolunteer = function(userId) {
  const volunteer = this.volunteers.find(v => v.user.equals(userId));
  if (!volunteer) {
    throw new Error('Волонтер не найден');
  }
  
  volunteer.status = 'confirmed';
  volunteer.confirmedAt = new Date();
};

// Method to complete volunteer work
volunteerTaskSchema.methods.completeVolunteerWork = function(userId, hoursWorked, rating, feedback) {
  const volunteer = this.volunteers.find(v => v.user.equals(userId));
  if (!volunteer) {
    throw new Error('Волонтер не найден');
  }
  
  volunteer.status = 'completed';
  volunteer.completedAt = new Date();
  volunteer.hoursWorked = hoursWorked;
  volunteer.rating = rating;
  volunteer.feedback = feedback;
};

// Method to cancel volunteer registration
volunteerTaskSchema.methods.cancelVolunteerRegistration = function(userId) {
  const volunteer = this.volunteers.find(v => v.user.equals(userId));
  if (!volunteer) {
    throw new Error('Волонтер не найден');
  }
  
  volunteer.status = 'cancelled';
};

// Method to start task
volunteerTaskSchema.methods.startTask = function() {
  this.actualStartTime = new Date();
  this.status = 'pending';
};

// Method to complete task
volunteerTaskSchema.methods.completeTask = function() {
  this.actualEndTime = new Date();
  this.status = 'completed';
};

// Static method to find tasks by location
volunteerTaskSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 5000) {
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
    status: 'active',
  });
};

// Static method to find available tasks
volunteerTaskSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    scheduledDate: { $gt: new Date() },
  }).where('registeredVolunteersCount').lt(this.maxVolunteers);
};

// Static method to get statistics
volunteerTaskSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        totalVolunteers: { $sum: { $size: '$volunteers' } },
        totalHours: { $sum: { $sum: '$volunteers.hoursWorked' } },
        avgRating: { $avg: { $avg: '$volunteers.rating' } },
      },
    },
  ]);
};

module.exports = mongoose.model('VolunteerTask', volunteerTaskSchema);
