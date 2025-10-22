const { User, Report, VolunteerTask } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Report,
          as: 'reports',
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: VolunteerTask,
          as: 'assignedTasks',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Обновить профиль пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *       400:
 *         description: Ошибка валидации
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, address, location } = req.body;
    const userId = req.user.id;

    const updateData = {
      firstName,
      lastName,
      phone,
      address
    };

    // Handle location update
    if (location && location.latitude && location.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: userId }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Получить статистику пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика пользователя
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [reportsCount, tasksCount, completedTasksCount] = await Promise.all([
      Report.count({ where: { userId } }),
      VolunteerTask.count({ where: { assignedTo: userId } }),
      VolunteerTask.count({ 
        where: { 
          assignedTo: userId, 
          status: 'completed' 
        } 
      })
    ]);

    const user = await User.findByPk(userId, {
      attributes: ['volunteerStats']
    });

    const stats = {
      reportsSubmitted: reportsCount,
      tasksAssigned: tasksCount,
      tasksCompleted: completedTasksCount,
      volunteerStats: user.volunteerStats
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/nearby:
 *   get:
 *     summary: Найти пользователей поблизости
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *     responses:
 *       200:
 *         description: Список пользователей поблизости
 */
const getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Координаты обязательны'
      });
    }

    const { sequelize } = require('../models');

    const nearbyUsers = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id }, // Исключить текущего пользователя
        location: {
          [Op.ne]: null
        },
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              'ST_DWithin',
              sequelize.col('location'),
              sequelize.fn('ST_MakePoint', longitude, latitude),
              radius
            ),
            true
          )
        ]
      },
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'avatar', 
        'role',
        'volunteerStats',
        [
          sequelize.fn(
            'ST_Distance',
            sequelize.col('location'),
            sequelize.fn('ST_MakePoint', longitude, latitude)
          ),
          'distance'
        ]
      ],
      order: [[sequelize.literal('distance'), 'ASC']],
      limit: 20
    });

    res.json({
      success: true,
      data: nearbyUsers
    });
  } catch (error) {
    logger.error('Error finding nearby users:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/volunteers:
 *   get:
 *     summary: Получить список волонтеров
 *     tags: [Users]
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
 *         name: skills
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список волонтеров
 */
const getVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, skills } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      role: { [Op.in]: ['volunteer', 'moderator', 'admin'] },
      isActive: true
    };

    // Фильтр по навыкам (если указан)
    if (skills) {
      const skillsArray = skills.split(',');
      // Здесь можно добавить поиск по навыкам в JSONB поле
    }

    const { count, rows: volunteers } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'avatar', 
        'role',
        'volunteerStats',
        'createdAt'
      ],
      order: [
        [sequelize.literal("volunteerStats->>'rating'"), 'DESC'],
        [sequelize.literal("volunteerStats->>'points'"), 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        volunteers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Получить публичный профиль пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Публичный профиль пользователя
 *       404:
 *         description: Пользователь не найден
 */
const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'avatar', 
        'role',
        'volunteerStats',
        'createdAt'
      ],
      include: [
        {
          model: Report,
          as: 'reports',
          where: { isAnonymous: false },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'status', 'createdAt']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error getting public profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  getNearbyUsers,
  getVolunteers,
  getPublicProfile
};
