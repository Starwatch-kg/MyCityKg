const { Report, User, Category, Comment, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Управление жалобами
 */

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: Получить список жалоб
 *     tags: [Reports]
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
 *           enum: [pending, in_progress, resolved, rejected]
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
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
 *         description: Список жалоб
 */
const getReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority, 
      latitude, 
      longitude, 
      radius = 10000 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    // Фильтры
    if (status) whereClause.status = status;
    if (category) whereClause.categoryId = category;
    if (priority) whereClause.priority = priority;

    // Геопространственный фильтр
    if (latitude && longitude) {
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn(
            'ST_DWithin',
            sequelize.col('Report.location'),
            sequelize.fn('ST_MakePoint', longitude, latitude),
            radius
          ),
          true
        )
      ];
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        },
        {
          model: Comment,
          as: 'comments',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Добавить расстояние если указаны координаты
    if (latitude && longitude) {
      for (let report of reports) {
        const distance = await sequelize.query(
          `SELECT ST_Distance(location, ST_MakePoint(${longitude}, ${latitude})) as distance 
           FROM reports WHERE id = ${report.id}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        report.dataValues.distance = distance[0]?.distance || null;
      }
    }

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     summary: Создать новую жалобу
 *     tags: [Reports]
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
 *                 enum: [low, medium, high, critical]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isAnonymous:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Жалоба создана
 *       400:
 *         description: Ошибка валидации
 */
const createReport = async (req, res) => {
  try {
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
      images = [],
      isAnonymous = false
    } = req.body;

    // Проверить существование категории
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    const reportData = {
      title,
      description,
      categoryId,
      location: sequelize.fn('ST_MakePoint', longitude, latitude),
      address,
      priority,
      images,
      isAnonymous,
      userId: isAnonymous ? null : req.user.id
    };

    const report = await Report.create(reportData);

    // Получить созданную жалобу с включенными данными
    const createdReport = await Report.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'user',
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
      message: 'Жалоба успешно создана',
      data: createdReport
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Получить жалобу по ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали жалобы
 *       404:
 *         description: Жалоба не найдена
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        },
        {
          model: Comment,
          as: 'comments',
          order: [['createdAt', 'ASC']],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }]
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Жалоба не найдена'
      });
    }

    // Увеличить счетчик просмотров
    await report.incrementViews();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error getting report by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/{id}/status:
 *   patch:
 *     summary: Обновить статус жалобы
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, rejected]
 *     responses:
 *       200:
 *         description: Статус обновлен
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Жалоба не найдена
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Проверить права (только модераторы и админы)
    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для изменения статуса'
      });
    }

    const [updatedRowsCount] = await Report.update(
      { status },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Жалоба не найдена'
      });
    }

    const updatedReport = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
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
      message: 'Статус жалобы обновлен',
      data: updatedReport
    });
  } catch (error) {
    logger.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/{id}/vote:
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
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [upvote, downvote]
 *     responses:
 *       200:
 *         description: Голос учтен
 *       404:
 *         description: Жалоба не найдена
 */
const voteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Жалоба не найдена'
      });
    }

    if (type === 'upvote') {
      await report.upvote();
    } else if (type === 'downvote') {
      await report.downvote();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Неверный тип голоса'
      });
    }

    res.json({
      success: true,
      message: 'Голос учтен',
      data: {
        upvotes: report.upvotes,
        downvotes: report.downvotes
      }
    });
  } catch (error) {
    logger.error('Error voting for report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/nearby:
 *   get:
 *     summary: Найти жалобы поблизости
 *     tags: [Reports]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Список жалоб поблизости
 */
const getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Координаты обязательны'
      });
    }

    const nearbyReports = await Report.findAll({
      where: {
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'nameKy', 'nameEn', 'icon', 'color']
        }
      ],
      attributes: [
        '*',
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
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: nearbyReports
    });
  } catch (error) {
    logger.error('Error finding nearby reports:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/stats:
 *   get:
 *     summary: Получить статистику жалоб
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Статистика жалоб
 */
const getReportsStats = async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports
    ] = await Promise.all([
      Report.count(),
      Report.count({ where: { status: 'pending' } }),
      Report.count({ where: { status: 'in_progress' } }),
      Report.count({ where: { status: 'resolved' } }),
      Report.count({ where: { status: 'rejected' } })
    ]);

    // Статистика по категориям
    const categoryStats = await Report.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'nameKy', 'nameEn']
      }],
      group: ['categoryId', 'category.id'],
      order: [[sequelize.literal('count'), 'DESC']]
    });

    const stats = {
      total: totalReports,
      byStatus: {
        pending: pendingReports,
        in_progress: inProgressReports,
        resolved: resolvedReports,
        rejected: rejectedReports
      },
      byCategory: categoryStats,
      resolutionRate: totalReports > 0 ? (resolvedReports / totalReports * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting reports stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = {
  getReports,
  createReport,
  getReportById,
  updateReportStatus,
  voteReport,
  getNearbyReports,
  getReportsStats
};
