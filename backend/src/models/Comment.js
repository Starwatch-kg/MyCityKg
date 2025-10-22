/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - userId
 *         - reportId
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор комментария
 *         content:
 *           type: string
 *           description: Содержание комментария
 *         userId:
 *           type: integer
 *           description: ID пользователя
 *         reportId:
 *           type: integer
 *           description: ID жалобы
 *         parentId:
 *           type: integer
 *           description: ID родительского комментария (для ответов)
 *         isEdited:
 *           type: boolean
 *           description: Был ли комментарий отредактирован
 *         editedAt:
 *           type: string
 *           format: date-time
 *           description: Время редактирования
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Содержание комментария обязательно'
        },
        len: {
          args: [1, 1000],
          msg: 'Комментарий должен содержать от 1 до 1000 символов'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    indexes: [
      {
        fields: ['reportId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['parentId']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      beforeUpdate: async (comment) => {
        if (comment.changed('content')) {
          comment.isEdited = true;
          comment.editedAt = new Date();
        }
      }
    }
  });

  // Class methods
  Comment.findByReport = function(reportId) {
    return this.findAll({ 
      where: { reportId },
      order: [['createdAt', 'ASC']]
    });
  };

  Comment.findByUser = function(userId) {
    return this.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  };

  Comment.findReplies = function(parentId) {
    return this.findAll({ 
      where: { parentId },
      order: [['createdAt', 'ASC']]
    });
  };

  return Comment;
};
