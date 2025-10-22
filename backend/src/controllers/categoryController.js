const { Category, Report, VolunteerTask, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Управление категориями
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Список категорий
 */
const getCategories = async (req, res) => {
  try {
    const { active = true } = req.query;
    
    const whereClause = {};
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const categories = await Category.findAll({
      where: whereClause,
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали категории
 *       404:
 *         description: Категория не найдена
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Report,
          as: 'reports',
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'status', 'createdAt']
        },
        {
          model: VolunteerTask,
          as: 'tasks',
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'status', 'createdAt']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Error getting category by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Создать новую категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - nameKy
 *               - nameEn
 *             properties:
 *               name:
 *                 type: string
 *               nameKy:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               priority:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Категория создана
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 */
const createCategory = async (req, res) => {
  try {
    // Проверить права (только админы)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для создания категорий'
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
      name,
      nameKy,
      nameEn,
      description,
      icon,
      color,
      priority = 0
    } = req.body;

    // Проверить уникальность названия
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Категория с таким названием уже существует'
      });
    }

    const categoryData = {
      name,
      nameKy,
      nameEn,
      description,
      icon,
      color,
      priority
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      data: category
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Обновить категорию
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               nameKy:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               priority:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Категория не найдена
 */
const updateCategory = async (req, res) => {
  try {
    // Проверить права (только админы)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для обновления категорий'
      });
    }

    const { id } = req.params;
    const {
      name,
      nameKy,
      nameEn,
      description,
      icon,
      color,
      priority,
      isActive
    } = req.body;

    // Проверить уникальность названия (исключая текущую категорию)
    if (name) {
      const existingCategory = await Category.findOne({ 
        where: { 
          name,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Категория с таким названием уже существует'
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (nameKy !== undefined) updateData.nameKy = nameKy;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedRowsCount] = await Category.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    const updatedCategory = await Category.findByPk(id);

    res.json({
      success: true,
      message: 'Категория успешно обновлена',
      data: updatedCategory
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
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
 *         description: Категория удалена
 *       400:
 *         description: Категория используется
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Категория не найдена
 */
const deleteCategory = async (req, res) => {
  try {
    // Проверить права (только админы)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для удаления категорий'
      });
    }

    const { id } = req.params;

    // Проверить, используется ли категория
    const [reportsCount, tasksCount] = await Promise.all([
      Report.count({ where: { categoryId: id } }),
      VolunteerTask.count({ where: { categoryId: id } })
    ]);

    if (reportsCount > 0 || tasksCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Категория не может быть удалена, так как используется в жалобах или задачах'
      });
    }

    const deletedRowsCount = await Category.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      message: 'Категория успешно удалена'
    });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}/stats:
 *   get:
 *     summary: Получить статистику категории
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Статистика категории
 *       404:
 *         description: Категория не найдена
 */
const getCategoryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    const [
      totalReports,
      pendingReports,
      resolvedReports,
      totalTasks,
      openTasks,
      completedTasks
    ] = await Promise.all([
      Report.count({ where: { categoryId: id } }),
      Report.count({ where: { categoryId: id, status: 'pending' } }),
      Report.count({ where: { categoryId: id, status: 'resolved' } }),
      VolunteerTask.count({ where: { categoryId: id } }),
      VolunteerTask.count({ where: { categoryId: id, status: 'open' } }),
      VolunteerTask.count({ where: { categoryId: id, status: 'completed' } })
    ]);

    const stats = {
      category: {
        id: category.id,
        name: category.name,
        nameKy: category.nameKy,
        nameEn: category.nameEn
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        resolutionRate: totalReports > 0 ? (resolvedReports / totalReports * 100).toFixed(2) : 0
      },
      tasks: {
        total: totalTasks,
        open: openTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};
