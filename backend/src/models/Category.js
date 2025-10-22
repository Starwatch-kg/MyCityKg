/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - nameKy
 *         - nameEn
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор категории
 *         name:
 *           type: string
 *           description: Название категории на русском
 *         nameKy:
 *           type: string
 *           description: Название категории на кыргызском
 *         nameEn:
 *           type: string
 *           description: Название категории на английском
 *         description:
 *           type: string
 *           description: Описание категории
 *         icon:
 *           type: string
 *           description: Иконка категории
 *         color:
 *           type: string
 *           description: Цвет категории
 *         isActive:
 *           type: boolean
 *           description: Активна ли категория
 *         priority:
 *           type: integer
 *           description: Приоритет отображения
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Название категории обязательно'
        },
        len: {
          args: [2, 100],
          msg: 'Название должно содержать от 2 до 100 символов'
        }
      }
    },
    nameKy: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Название на кыргызском обязательно'
        }
      }
    },
    nameEn: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Название на английском обязательно'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Некорректный URL иконки'
        }
      }
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          msg: 'Некорректный формат цвета'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      {
        fields: ['isActive']
      },
      {
        fields: ['priority']
      },
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  // Class methods
  Category.findActive = function() {
    return this.findAll({ 
      where: { isActive: true },
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });
  };

  Category.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  return Category;
};
