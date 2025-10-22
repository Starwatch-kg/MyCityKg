const express = require('express');
const { body, query, validationResult } = require('express-validator');

const { VolunteerTask, User } = require('../models');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/config');

const router = express.Router();

/**
 * @swagger
 * /volunteers/tasks:
 *   get:
 *     summary: Получить список волонтерских задач
 *     tags: [Volunteers]
 *     parameters:
 *       - in: query
 *         name: taskType
 *         schema:
 *           type: string
 *         description: Фильтр по типу задачи
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Фильтр по статусу
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
 *         description: Список волонтерских задач
 */
router.get('/tasks', optionalAuth, [
  query('taskType').optional().isIn(config.constants.volunteerTaskTypes),
  query('status').optional().isIn(config.constants.volunteerStatuses),
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
    taskType,
    status = 'active',
    latitude,
    longitude,
    radius = 5000,
    limit = config.pagination.defaultLimit,
    offset = 0,
  } = req.query;

  // Build query
  const query = {};
  
  if (taskType) query.taskType = taskType;
  if (status) query.status = status;

  // Only show future tasks for active status
  if (status === 'active') {
    query.scheduledDate = { $gt: new Date() };
  }

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
    const tasks = await VolunteerTask.find(query)
      .populate('organizer', 'firstName lastName avatar')
      .populate('volunteers.user', 'firstName lastName avatar')
      .populate('relatedReport', 'title category')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await VolunteerTask.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching volunteer tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения задач',
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID
 *     tags: [Volunteers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные задачи
 *       404:
 *         description: Задача не найдена
 */
router.get('/tasks/:id', optionalAuth, asyncHandler(async (req, res) => {
  const task = await VolunteerTask.findById(req.params.id)
    .populate('organizer', 'firstName lastName avatar')
    .populate('volunteers.user', 'firstName lastName avatar')
    .populate('relatedReport', 'title category status');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Задача не найдена',
    });
  }

  res.json({
    success: true,
    data: task,
  });
}));

/**
 * @swagger
 * /volunteers/tasks:
 *   post:
 *     summary: Создать новую волонтерскую задачу
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - taskType
 *               - location
 *               - scheduledDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               taskType:
 *                 type: string
 *               location:
 *                 type: object
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               estimatedDuration:
 *                 type: number
 *               maxVolunteers:
 *                 type: integer
 *               requirements:
 *                 type: object
 *               rewards:
 *                 type: object
 *     responses:
 *       201:
 *         description: Задача создана
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 */
router.post('/tasks', auth, authorize('volunteer', 'moderator', 'admin'), [
  body('title')
    .trim()
    .isLength({ min: 5, max: config.validation.maxTitleLength })
    .withMessage(`Название должно содержать от 5 до ${config.validation.maxTitleLength} символов`),
  body('description')
    .trim()
    .isLength({ min: config.validation.minDescriptionLength, max: config.validation.maxDescriptionLength })
    .withMessage(`Описание должно содержать от ${config.validation.minDescriptionLength} до ${config.validation.maxDescriptionLength} символов`),
  body('taskType')
    .isIn(config.constants.volunteerTaskTypes)
    .withMessage('Некорректный тип задачи'),
  body('scheduledDate')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Дата должна быть в будущем');
      }
      return true;
    }),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Некорректные координаты'),
  body('maxVolunteers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество волонтеров должно быть от 1 до 100'),
  body('estimatedDuration')
    .optional()
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Продолжительность должна быть от 0.5 до 24 часов'),
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
    taskType,
    location,
    address,
    scheduledDate,
    estimatedDuration = 2,
    maxVolunteers = 10,
    requirements = {},
    rewards = {},
    relatedReport,
    tags = [],
  } = req.body;

  try {
    const task = new VolunteerTask({
      title,
      description,
      taskType,
      location,
      address,
      organizer: req.user._id,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      maxVolunteers,
      requirements,
      rewards,
      relatedReport,
      tags,
    });

    await task.save();
    await task.populate('organizer', 'firstName lastName avatar');

    logger.info(`New volunteer task created: ${task._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Задача успешно создана',
      data: task,
    });
  } catch (error) {
    logger.error('Error creating volunteer task:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания задачи',
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/{id}/register:
 *   post:
 *     summary: Зарегистрироваться на задачу
 *     tags: [Volunteers]
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
 *         description: Регистрация успешна
 *       400:
 *         description: Ошибка регистрации
 *       404:
 *         description: Задача не найдена
 */
router.post('/tasks/:id/register', auth, asyncHandler(async (req, res) => {
  const task = await VolunteerTask.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Задача не найдена',
    });
  }

  try {
    task.registerVolunteer(req.user._id);
    await task.save();

    logger.info(`User ${req.user._id} registered for task ${task._id}`);

    res.json({
      success: true,
      message: 'Вы успешно зарегистрированы на задачу',
      data: {
        registeredVolunteersCount: task.registeredVolunteersCount,
        availableSpots: task.availableSpots,
      },
    });
  } catch (error) {
    logger.error('Error registering for task:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/{id}/register:
 *   delete:
 *     summary: Отменить регистрацию на задачу
 *     tags: [Volunteers]
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
 *         description: Регистрация отменена
 *       404:
 *         description: Задача не найдена
 */
router.delete('/tasks/:id/register', auth, asyncHandler(async (req, res) => {
  const task = await VolunteerTask.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Задача не найдена',
    });
  }

  try {
    task.cancelVolunteerRegistration(req.user._id);
    await task.save();

    logger.info(`User ${req.user._id} cancelled registration for task ${task._id}`);

    res.json({
      success: true,
      message: 'Регистрация отменена',
      data: {
        registeredVolunteersCount: task.registeredVolunteersCount,
        availableSpots: task.availableSpots,
      },
    });
  } catch (error) {
    logger.error('Error cancelling task registration:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/{id}/complete:
 *   post:
 *     summary: Отметить задачу как выполненную
 *     tags: [Volunteers]
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
 *               - hoursWorked
 *               - rating
 *             properties:
 *               hoursWorked:
 *                 type: number
 *                 minimum: 0.1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Задача отмечена как выполненная
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Задача не найдена
 */
router.post('/tasks/:id/complete', auth, [
  body('hoursWorked')
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('Количество часов должно быть от 0.1 до 24'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг должен быть от 1 до 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Отзыв не должен превышать 500 символов'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const task = await VolunteerTask.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Задача не найдена',
    });
  }

  const { hoursWorked, rating, feedback } = req.body;

  try {
    task.completeVolunteerWork(req.user._id, hoursWorked, rating, feedback);
    await task.save();

    // Update user stats
    req.user.updateStats('tasksCompleted');
    req.user.updateStats('volunteerHours', hoursWorked);
    await req.user.save();

    logger.info(`User ${req.user._id} completed task ${task._id} with ${hoursWorked} hours`);

    res.json({
      success: true,
      message: 'Задача отмечена как выполненная',
      data: {
        completedVolunteersCount: task.completedVolunteersCount,
        totalHoursWorked: task.totalHoursWorked,
        averageRating: task.averageRating,
      },
    });
  } catch (error) {
    logger.error('Error completing task:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/{id}/confirm:
 *   post:
 *     summary: Подтвердить участие волонтера (только для организаторов)
 *     tags: [Volunteers]
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
 *               - volunteerId
 *             properties:
 *               volunteerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Волонтер подтвержден
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Задача не найдена
 */
router.post('/tasks/:id/confirm', auth, [
  body('volunteerId').isMongoId().withMessage('Некорректный ID волонтера'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array(),
    });
  }

  const task = await VolunteerTask.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Задача не найдена',
    });
  }

  // Check if user is organizer or has moderator/admin role
  const canConfirm = task.organizer.equals(req.user._id) || 
                     ['moderator', 'admin'].includes(req.user.role);
  
  if (!canConfirm) {
    return res.status(403).json({
      success: false,
      message: 'Недостаточно прав для подтверждения',
    });
  }

  const { volunteerId } = req.body;

  try {
    task.confirmVolunteer(volunteerId);
    await task.save();

    logger.info(`Volunteer ${volunteerId} confirmed for task ${task._id} by ${req.user._id}`);

    res.json({
      success: true,
      message: 'Волонтер подтвержден',
      data: {
        confirmedVolunteersCount: task.confirmedVolunteersCount,
      },
    });
  } catch (error) {
    logger.error('Error confirming volunteer:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}));

/**
 * @swagger
 * /volunteers/stats:
 *   get:
 *     summary: Получить статистику волонтера
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика волонтера
 *       401:
 *         description: Не авторизован
 */
router.get('/stats', auth, asyncHandler(async (req, res) => {
  try {
    // Get user's volunteer statistics
    const userStats = req.user.stats;
    
    // Get additional statistics from tasks
    const userTasks = await VolunteerTask.find({
      'volunteers.user': req.user._id,
    });

    const completedTasks = userTasks.filter(task => {
      const volunteer = task.volunteers.find(v => v.user.equals(req.user._id));
      return volunteer && volunteer.status === 'completed';
    });

    const totalRatings = completedTasks
      .map(task => {
        const volunteer = task.volunteers.find(v => v.user.equals(req.user._id));
        return volunteer ? volunteer.rating : 0;
      })
      .filter(rating => rating > 0);

    const averageRating = totalRatings.length > 0 
      ? totalRatings.reduce((sum, rating) => sum + rating, 0) / totalRatings.length 
      : 0;

    const stats = {
      tasksCompleted: completedTasks.length,
      hoursWorked: completedTasks.reduce((total, task) => {
        const volunteer = task.volunteers.find(v => v.user.equals(req.user._id));
        return total + (volunteer ? volunteer.hoursWorked : 0);
      }, 0),
      rating: averageRating,
      reportsSubmitted: userStats.reportsSubmitted,
      reportsResolved: userStats.reportsResolved,
      tasksRegistered: userTasks.length,
      tasksCancelled: userTasks.filter(task => {
        const volunteer = task.volunteers.find(v => v.user.equals(req.user._id));
        return volunteer && volunteer.status === 'cancelled';
      }).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching volunteer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики',
    });
  }
}));

/**
 * @swagger
 * /volunteers/tasks/statistics:
 *   get:
 *     summary: Получить общую статистику задач
 *     tags: [Volunteers]
 *     responses:
 *       200:
 *         description: Статистика задач
 */
router.get('/tasks/statistics', asyncHandler(async (req, res) => {
  try {
    const stats = await VolunteerTask.getStatistics();
    
    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        totalVolunteers: 0,
        totalHours: 0,
        avgRating: 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching task statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики',
    });
  }
}));

module.exports = router;
