const { Comment, User, Report } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Управление комментариями
 */

/**
 * @swagger
 * /api/v1/reports/{reportId}/comments:
 *   get:
 *     summary: Получить комментарии к жалобе
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Список комментариев
 *       404:
 *         description: Жалоба не найдена
 */
const getCommentsByReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Проверить существование жалобы
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Жалоба не найдена'
      });
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { 
        reportId,
        parentId: null // Только корневые комментарии
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting comments by report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/{reportId}/comments:
 *   post:
 *     summary: Добавить комментарий к жалобе
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Комментарий добавлен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Жалоба не найдена
 */
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const { reportId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    // Проверить существование жалобы
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Жалоба не найдена'
      });
    }

    // Если это ответ на комментарий, проверить существование родительского комментария
    if (parentId) {
      const parentComment = await Comment.findOne({
        where: { 
          id: parentId,
          reportId // Убедиться, что родительский комментарий относится к той же жалобе
        }
      });
      if (!parentComment) {
        return res.status(400).json({
          success: false,
          message: 'Родительский комментарий не найден'
        });
      }
    }

    const commentData = {
      content,
      userId,
      reportId,
      parentId: parentId || null
    };

    const comment = await Comment.create(commentData);

    // Получить созданный комментарий с включенными данными
    const createdComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Комментарий успешно добавлен',
      data: createdComment
    });
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   get:
 *     summary: Получить комментарий по ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали комментария
 *       404:
 *         description: Комментарий не найден
 */
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Report,
          as: 'report',
          attributes: ['id', 'title']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Комментарий не найден'
      });
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('Error getting comment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   put:
 *     summary: Обновить комментарий
 *     tags: [Comments]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Комментарий обновлен
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Комментарий не найден
 */
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Комментарий не найден'
      });
    }

    // Проверить права (только автор комментария или модератор/админ)
    if (comment.userId !== userId && !['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для редактирования комментария'
      });
    }

    await comment.update({ content });

    // Получить обновленный комментарий
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }]
    });

    res.json({
      success: true,
      message: 'Комментарий успешно обновлен',
      data: updatedComment
    });
  } catch (error) {
    logger.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: Удалить комментарий
 *     tags: [Comments]
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
 *         description: Комментарий удален
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Комментарий не найден
 */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Комментарий не найден'
      });
    }

    // Проверить права (только автор комментария или модератор/админ)
    if (comment.userId !== userId && !['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для удаления комментария'
      });
    }

    // Удалить комментарий и все его ответы (каскадное удаление настроено в модели)
    await comment.destroy();

    res.json({
      success: true,
      message: 'Комментарий успешно удален'
    });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{userId}/comments:
 *   get:
 *     summary: Получить комментарии пользователя
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Список комментариев пользователя
 *       404:
 *         description: Пользователь не найден
 */
const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Проверить существование пользователя
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Report,
          as: 'report',
          attributes: ['id', 'title', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting comments by user:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/comments/recent:
 *   get:
 *     summary: Получить последние комментарии
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Список последних комментариев
 */
const getRecentComments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Report,
          as: 'report',
          attributes: ['id', 'title', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error('Error getting recent comments:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = {
  getCommentsByReport,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByUser,
  getRecentComments
};
