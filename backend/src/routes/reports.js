const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const { Report, User } = require('../models');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/config');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 5, // Maximum 5 images per report
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Получить список жалоб
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Фильтр по статусу
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Фильтр по приоритету
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Широта для поиска по местоположению
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Долгота для поиска по местоположению
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Радиус поиска в метрах
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество результатов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Смещение для пагинации
 *     responses:
 *       200:
 *         description: Список жалоб
 */
router.get('/', optionalAuth, [
  query('category').optional().isIn(config.constants.reportCategories),
  query('status').optional().isIn(config.constants.reportStatuses),
  query('priority').optional().isIn(config.constants.reportPriorities),
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0 }),
  query('limit').optional().isInt({ min: 1, max: config.pagination.maxLimit }),
  query('offset').optional().isInt({ min: 0 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const {
    category,
    status,
    priority,
    latitude,
    longitude,
    radius = 5000,
    limit = config.pagination.defaultLimit,
    offset = 0,
  } = req.query;

  // Build query
  const query = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  // Location-based search
  if (latitude && longitude) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(radius),
      },
    };
  }

  try {
    const reports = await Report.findAll({
      where: query,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Report.count({ where: query });

    // Filter out user info for anonymous reports
    const filteredReports = reports.map(report => {
      const reportObj = report.toJSON();
      if (report.isAnonymous) {
        reportObj.user = null;
      }
      return reportObj;
    });

    res.json({
      success: true,
      data: {
        reports: filteredReports,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения жалоб',
    });
  }
}));

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Получить жалобу по ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные жалобы
 *       404:
 *         description: Жалоба не найдена
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const report = await Report.findByPk(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Жалоба не найдена',
    });
  }

  // Increment view count
  await report.incrementViewCount();

  // Filter user info for anonymous reports
  const reportObj = report.toObject();
  if (report.isAnonymous) {
    reportObj.user = null;
  }

  res.json({
    success: true,
    data: reportObj,
  });
}));

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Создать новую жалобу
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               location:
 *                 type: string
 *                 description: JSON string with location data
 *               address:
 *                 type: string
 *               isAnonymous:
 *                 type: boolean
 *               tags:
 *                 type: string
 *                 description: JSON array of tags
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Жалоба создана
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', auth, upload.array('images', 5), [
  body('title')
    .trim()
    .isLength({ min: 5, max: config.validation.maxTitleLength })
    .withMessage(`Заголовок должен содержать от 5 до ${config.validation.maxTitleLength} символов`),
  body('description')
    .trim()
    .isLength({ min: config.validation.minDescriptionLength, max: config.validation.maxDescriptionLength })
    .withMessage(`Описание должно содержать от ${config.validation.minDescriptionLength} до ${config.validation.maxDescriptionLength} символов`),
  body('category')
    .isIn(config.constants.reportCategories)
    .withMessage('Некорректная категория'),
  body('priority')
    .optional()
    .isIn(config.constants.reportPriorities)
    .withMessage('Некорректный приоритет'),
  body('location')
    .custom((value) => {
      try {
        const location = JSON.parse(value);
        if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
          throw new Error('Некорректные координаты');
        }
        return true;
      } catch (error) {
        throw new Error('Некорректный формат местоположения');
      }
    }),
  body('isAnonymous').optional().isBoolean(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const {
    title,
    description,
    category,
    priority = 'medium',
    location,
    address,
    isAnonymous = false,
    tags,
  } = req.body;

  try {
    // Parse location and tags
    const locationData = JSON.parse(location);
    const tagsArray = tags ? JSON.parse(tags) : [];

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      // TODO: Upload images to Cloudinary
      // For now, we'll create placeholder image data
      for (const file of req.files) {
        images.push({
          url: `https://placeholder.com/400x300?text=${encodeURIComponent(file.originalname)}`,
          publicId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          caption: file.originalname,
        });
      }
    }

    // Create report
    const report = new Report({
      title,
      description,
      category,
      priority,
      location: locationData,
      address,
      images,
      user: req.user._id,
      isAnonymous,
      tags: tagsArray,
      metadata: {
        deviceInfo: req.get('User-Agent'),
        appVersion: req.get('App-Version'),
        submissionMethod: 'mobile',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    await report.save();

    // Update user stats
    req.user.updateStats('reportsSubmitted');
    await req.user.save();

    // Populate user data for response
    await report.populate('user', 'firstName lastName avatar');

    // Send notification to nearby users (TODO: implement)
    
    logger.info(`New report created: ${report._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Жалоба успешно создана',
      data: report,
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания жалобы',
    });
  }
}));

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     summary: Обновить жалобу
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Жалоба обновлена
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Жалоба не найдена
 */
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: config.validation.maxTitleLength }),
  body('description').optional().trim().isLength({ min: config.validation.minDescriptionLength, max: config.validation.maxDescriptionLength }),
  body('category').optional().isIn(config.constants.reportCategories),
  body('priority').optional().isIn(config.constants.reportPriorities),
  body('status').optional().isIn(config.constants.reportStatuses),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Жалоба не найдена',
    });
  }

  // Check permissions
  const canEdit = report.user.equals(req.user._id) || 
                  ['moderator', 'admin'].includes(req.user.role);
  
  if (!canEdit) {
    return res.status(403).json({
      success: false,
      message: 'Недостаточно прав для редактирования',
    });
  }

  // Update allowed fields
  const allowedUpdates = ['title', 'description', 'category', 'priority', 'tags'];
  const moderatorUpdates = ['status', 'assignedTo', 'estimatedResolutionDate', 'resolutionNotes'];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      report[key] = req.body[key];
    } else if (moderatorUpdates.includes(key) && ['moderator', 'admin'].includes(req.user.role)) {
      report[key] = req.body[key];
    }
  });

  // Set resolution date if status is resolved
  if (req.body.status === 'resolved' && report.status !== 'resolved') {
    report.actualResolutionDate = new Date();
  }

  await report.save();
  await report.populate('user', 'firstName lastName avatar');

  logger.info(`Report updated: ${report._id} by user ${req.user._id}`);

  res.json({
    success: true,
    message: 'Жалоба обновлена',
    data: report,
  });
}));

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Удалить жалобу
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Жалоба удалена
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Жалоба не найдена
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Жалоба не найдена',
    });
  }

  // Check permissions
  const canDelete = report.user.equals(req.user._id) || 
                    ['moderator', 'admin'].includes(req.user.role);
  
  if (!canDelete) {
    return res.status(403).json({
      success: false,
      message: 'Недостаточно прав для удаления',
    });
  }

  await Report.findByIdAndDelete(req.params.id);

  logger.info(`Report deleted: ${req.params.id} by user ${req.user._id}`);

  res.json({
    success: true,
    message: 'Жалоба удалена',
  });
}));

/**
 * @swagger
 * /reports/{id}/vote:
 *   post:
 *     summary: Проголосовать за жалобу
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vote
 *             properties:
 *               vote:
 *                 type: string
 *                 enum: [up, down]
 *     responses:
 *       200:
 *         description: Голос учтен
 *       404:
 *         description: Жалоба не найдена
 */
router.post('/:id/vote', auth, [
  body('vote').isIn(['up', 'down']).withMessage('Некорректный тип голоса'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Жалоба не найдена',
    });
  }

  const { vote } = req.body;
  
  // Add or update vote
  report.addVote(req.user._id, vote);
  await report.save();

  logger.info(`Vote added: ${vote} for report ${report._id} by user ${req.user._id}`);

  res.json({
    success: true,
    message: 'Голос учтен',
    data: {
      votes: report.votes,
      totalVotes: report.totalVotes,
    },
  });
}));

/**
 * @swagger
 * /reports/{id}/vote:
 *   delete:
 *     summary: Удалить голос
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Голос удален
 *       404:
 *         description: Жалоба не найдена
 */
router.delete('/:id/vote', auth, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Жалоба не найдена',
    });
  }

  // Remove vote
  report.removeVote(req.user._id);
  await report.save();

  logger.info(`Vote removed for report ${report._id} by user ${req.user._id}`);

  res.json({
    success: true,
    message: 'Голос удален',
    data: {
      votes: report.votes,
      totalVotes: report.totalVotes,
    },
  });
}));

/**
 * @swagger
 * /reports/statistics:
 *   get:
 *     summary: Получить статистику жалоб
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Статистика жалоб
 */
router.get('/statistics', asyncHandler(async (req, res) => {
  try {
    const stats = await Report.getStatistics();
    
    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        avgResolutionTime: 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching report statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики',
    });
  }
}));

module.exports = router;
