/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор жалобы
 *         title:
 *           type: string
 *           description: Заголовок жалобы
 *         description:
 *           type: string
 *           description: Описание проблемы
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         address:
 *           type: string
 *           description: Адрес проблемы
 *         categoryId:
 *           type: integer
 *           description: ID категории
 *         userId:
 *           type: integer
 *           description: ID пользователя (null для анонимных)
 *         status:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *           description: Статус жалобы
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Приоритет
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs изображений
 *         isAnonymous:
 *           type: boolean
 *           description: Анонимная ли жалоба
 *         upvotes:
 *           type: integer
 *           description: Количество голосов "за"
 *         downvotes:
 *           type: integer
 *           description: Количество голосов "против"
 *         viewsCount:
 *           type: integer
 *           description: Количество просмотров
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: Время решения
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Заголовок обязателен'
        },
        len: {
          args: [5, 200],
          msg: 'Заголовок должен содержать от 5 до 200 символов'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Описание обязательно'
        },
        len: {
          args: [10, 2000],
          msg: 'Описание должно содержать от 10 до 2000 символов'
        }
      }
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    downvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'reports',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['location'],
        using: 'gist'
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['isAnonymous']
      }
    ],
    hooks: {
      beforeUpdate: async (report) => {
        if (report.changed('status') && report.status === 'resolved' && !report.resolvedAt) {
          report.resolvedAt = new Date();
        }
      }
    }
  });

  // Instance methods
  Report.prototype.incrementViews = async function() {
    this.viewsCount += 1;
    return this.save();
  };

  Report.prototype.upvote = async function() {
    this.upvotes += 1;
    return this.save();
  };

  Report.prototype.downvote = async function() {
    this.downvotes += 1;
    return this.save();
  };

  // Class methods
  Report.findByStatus = function(status) {
    return this.findAll({ where: { status } });
  };

  Report.findByCategory = function(categoryId) {
    return this.findAll({ where: { categoryId } });
  };

  Report.findByUser = function(userId) {
    return this.findAll({ where: { userId } });
  };

  Report.findNearby = function(latitude, longitude, radiusKm = 5) {
    return this.findAll({
      where: sequelize.where(
        sequelize.fn(
          'ST_DWithin',
          sequelize.col('location'),
          sequelize.fn('ST_MakePoint', longitude, latitude),
          radiusKm * 1000
        ),
        true
      )
    });
  };

  Report.findRecent = function(limit = 10) {
    return this.findAll({
      order: [['createdAt', 'DESC']],
      limit
    });
  };

  return Report;
};
