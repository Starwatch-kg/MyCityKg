const express = require('express');
const { User, Report, VolunteerTask, Category } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Получить статистику системы
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика системы
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
router.get('/stats', auth, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      totalTasks,
      totalCategories
    ] = await Promise.all([
      User.count(),
      Report.count(),
      VolunteerTask.count(),
      Category.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalReports,
        totalTasks,
        totalCategories
      }
    });
  } catch (error) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
