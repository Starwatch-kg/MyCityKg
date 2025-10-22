const { VolunteerTask, User, Category, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Volunteer Tasks
 *   description: Управление волонтерскими задачами
 */

/**
 * @swagger
 * /api/v1/volunteer/tasks:
 *   get:
 *     summary: Получить список волонтерских задач
 *     tags: [Volunteer Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, assigned, in_progress, completed, cancelled]
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10000
 *     responses:
 *       200:
 *         description: Список волонтерских задач
 */
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      difficulty, 
      category, 
      latitude, 
      longitude, 
      radius = 10000 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    // Фильтры
    if (status) whereClause.status = status;
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.categoryId = category;

    // Геопространственный фильтр
    if (latitude && longitude) {
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn(
            'ST_DWithin',
            sequelize.col('VolunteerTask.location'),
            sequelize.fn('ST_MakePoint', longitude, latitude),
            radius
          ),
          true
        )
      ];
    }

    const { count, rows: tasks } = await VolunteerTask.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Добавить расстояние если указаны координаты
    if (latitude && longitude) {
      for (let task of tasks) {
        const distance = await sequelize.query(
          `SELECT ST_Distance(location, ST_MakePoint(${longitude}, ${latitude})) as distance 
           FROM volunteer_tasks WHERE id = ${task.id}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        task.dataValues.distance = distance[0]?.distance || null;
      }
    }

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting volunteer tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/tasks:
 *   post:
 *     summary: Создать новую волонтерскую задачу
 *     tags: [Volunteer Tasks]
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
 *               - categoryId
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               estimatedHours:
 *                 type: number
 *               maxVolunteers:
 *                 type: integer
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Задача создана
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 */
const createTask = async (req, res) => {
  try {
    // Проверить права (только волонтеры, модераторы и админы)
    if (!['volunteer', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для создания задач'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      categoryId,
      latitude,
      longitude,
      address,
      priority = 'medium',
      difficulty = 'medium',
      estimatedHours,
      maxVolunteers = 1,
      requiredSkills = [],
      images = [],
      deadline
    } = req.body;

    // Проверить существование категории
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    const taskData = {
      title,
      description,
      categoryId,
      location: sequelize.fn('ST_MakePoint', longitude, latitude),
      address,
      priority,
      difficulty,
      estimatedHours,
      maxVolunteers,
      requiredSkills,
      images,
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user.id
    };

    const task = await VolunteerTask.create(taskData);

    // Получить созданную задачу с включенными данными
    const createdTask = await VolunteerTask.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Волонтерская задача успешно создана',
      data: createdTask
    });
  } catch (error) {
    logger.error('Error creating volunteer task:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID
 *     tags: [Volunteer Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали задачи
 *       404:
 *         description: Задача не найдена
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await VolunteerTask.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Error getting task by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/tasks/{id}/assign:
 *   post:
 *     summary: Назначить волонтера на задачу
 *     tags: [Volunteer Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Волонтер назначен
 *       400:
 *         description: Задача недоступна для назначения
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Задача не найдена
 */
const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверить права (только волонтеры и выше)
    if (!['volunteer', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для назначения на задачи'
      });
    }

    const task = await VolunteerTask.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверить, что задача доступна для назначения
    if (task.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Задача недоступна для назначения'
      });
    }

    // Проверить, что не превышено максимальное количество волонтеров
    if (task.currentVolunteers >= task.maxVolunteers) {
      return res.status(400).json({
        success: false,
        message: 'Достигнуто максимальное количество волонтеров'
      });
    }

    // Назначить волонтера
    await task.assignVolunteer(userId);

    // Получить обновленную задачу
    const updatedTask = await VolunteerTask.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Вы успешно назначены на задачу',
      data: updatedTask
    });
  } catch (error) {
    logger.error('Error assigning task:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/tasks/{id}/start:
 *   post:
 *     summary: Начать выполнение задачи
 *     tags: [Volunteer Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Задача начата
 *       400:
 *         description: Задача не может быть начата
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Задача не найдена
 */
const startTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await VolunteerTask.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверить, что пользователь назначен на задачу
    if (task.assignedTo !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы не назначены на эту задачу'
      });
    }

    // Начать выполнение задачи
    await task.startWork();

    // Получить обновленную задачу
    const updatedTask = await VolunteerTask.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Выполнение задачи начато',
      data: updatedTask
    });
  } catch (error) {
    logger.error('Error starting task:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/tasks/{id}/complete:
 *   post:
 *     summary: Завершить выполнение задачи
 *     tags: [Volunteer Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualHours:
 *                 type: number
 *               completionNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Задача завершена
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Задача не найдена
 */
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualHours, completionNotes } = req.body;
    const userId = req.user.id;

    const task = await VolunteerTask.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверить, что пользователь назначен на задачу или имеет права модератора
    if (task.assignedTo !== userId && !['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для завершения задачи'
      });
    }

    // Завершить задачу
    await task.complete(actualHours);

    // Обновить статистику волонтера
    if (task.assignedTo) {
      const volunteer = await User.findByPk(task.assignedTo);
      if (volunteer) {
        const stats = volunteer.volunteerStats;
        stats.tasksCompleted += 1;
        stats.volunteerHours += actualHours || task.estimatedHours || 0;
        stats.points += 10; // Базовые очки за выполнение задачи
        
        await volunteer.update({ volunteerStats: stats });
      }
    }

    // Получить обновленную задачу
    const updatedTask = await VolunteerTask.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Задача успешно завершена',
      data: updatedTask
    });
  } catch (error) {
    logger.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/my-tasks:
 *   get:
 *     summary: Получить задачи текущего пользователя
 *     tags: [Volunteer Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [created, assigned]
 *           default: assigned
 *     responses:
 *       200:
 *         description: Список задач пользователя
 */
const getMyTasks = async (req, res) => {
  try {
    const { type = 'assigned' } = req.query;
    const userId = req.user.id;

    const whereClause = type === 'created' 
      ? { createdBy: userId }
      : { assignedTo: userId };

    const tasks = await VolunteerTask.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    logger.error('Error getting user tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/volunteer/stats:
 *   get:
 *     summary: Получить статистику волонтерских задач
 *     tags: [Volunteer Tasks]
 *     responses:
 *       200:
 *         description: Статистика задач
 */
const getTasksStats = async (req, res) => {
  try {
    const [
      totalTasks,
      openTasks,
      assignedTasks,
      inProgressTasks,
      completedTasks,
      cancelledTasks
    ] = await Promise.all([
      VolunteerTask.count(),
      VolunteerTask.count({ where: { status: 'open' } }),
      VolunteerTask.count({ where: { status: 'assigned' } }),
      VolunteerTask.count({ where: { status: 'in_progress' } }),
      VolunteerTask.count({ where: { status: 'completed' } }),
      VolunteerTask.count({ where: { status: 'cancelled' } })
    ]);

    // Статистика по сложности
    const difficultyStats = await VolunteerTask.findAll({
      attributes: [
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['difficulty'],
      order: [[sequelize.literal('count'), 'DESC']]
    });

    const stats = {
      total: totalTasks,
      byStatus: {
        open: openTasks,
        assigned: assignedTasks,
        in_progress: inProgressTasks,
        completed: completedTasks,
        cancelled: cancelledTasks
      },
      byDifficulty: difficultyStats,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting tasks stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  assignTask,
  startTask,
  completeTask,
  getMyTasks,
  getTasksStats
};
