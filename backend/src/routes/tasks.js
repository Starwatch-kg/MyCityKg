const express = require('express');
const { VolunteerTask } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Получить список задач волонтеров
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Список задач
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await VolunteerTask.findAll({
      include: ['category', 'creator', 'assignedUser'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Создать новую задачу волонтера
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Задача создана
 *       401:
 *         description: Не авторизован
 */
router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };

    const task = await VolunteerTask.create(taskData);

    res.status(201).json({
      success: true,
      message: 'Задача создана',
      data: task
    });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
