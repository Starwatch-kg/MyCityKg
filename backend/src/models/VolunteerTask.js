/**
 * @swagger
 * components:
 *   schemas:
 *     VolunteerTask:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - categoryId
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор задачи
 *         title:
 *           type: string
 *           description: Название задачи
 *         description:
 *           type: string
 *           description: Описание задачи
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
 *           description: Адрес задачи
 *         categoryId:
 *           type: integer
 *           description: ID категории
 *         createdBy:
 *           type: integer
 *           description: ID создателя задачи
 *         assignedTo:
 *           type: integer
 *           description: ID назначенного волонтера
 *         status:
 *           type: string
 *           enum: [open, assigned, in_progress, completed, cancelled]
 *           description: Статус задачи
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Приоритет
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Сложность задачи
 *         estimatedHours:
 *           type: number
 *           description: Оценочное время выполнения в часах
 *         actualHours:
 *           type: number
 *           description: Фактическое время выполнения
 *         maxVolunteers:
 *           type: integer
 *           description: Максимальное количество волонтеров
 *         currentVolunteers:
 *           type: integer
 *           description: Текущее количество волонтеров
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *           description: Необходимые навыки
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs изображений
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Крайний срок выполнения
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Время завершения
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const VolunteerTask = sequelize.define('VolunteerTask', {
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
          msg: 'Название задачи обязательно'
        },
        len: {
          args: [5, 200],
          msg: 'Название должно содержать от 5 до 200 символов'
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
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('location');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('location', JSON.stringify(value));
      }
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
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('open', 'assigned', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'open',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
      allowNull: false
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      validate: {
        min: 0.5,
        max: 100
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 200
      }
    },
    maxVolunteers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 1,
        max: 50
      }
    },
    currentVolunteers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    requiredSkills: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('requiredSkills');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('requiredSkills', JSON.stringify(value || []));
      }
    },
    images: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('images');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('images', JSON.stringify(value || []));
      }
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Крайний срок должен быть в будущем'
        }
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      defaultValue: '{}',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : {};
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      }
    }
  }, {
    tableName: 'volunteer_tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['assignedTo']
      },
      {
        fields: ['location'],
        using: 'gist'
      },
      {
        fields: ['deadline']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      beforeUpdate: async (task) => {
        if (task.changed('status') && task.status === 'completed' && !task.completedAt) {
          task.completedAt = new Date();
        }
      }
    }
  });

  // Instance methods
  VolunteerTask.prototype.assignVolunteer = async function(userId) {
    if (this.currentVolunteers >= this.maxVolunteers) {
      throw new Error('Максимальное количество волонтеров уже назначено');
    }
    
    this.assignedTo = userId;
    this.currentVolunteers += 1;
    this.status = 'assigned';
    return this.save();
  };

  VolunteerTask.prototype.startWork = async function() {
    if (this.status !== 'assigned') {
      throw new Error('Задача должна быть назначена для начала работы');
    }
    
    this.status = 'in_progress';
    return this.save();
  };

  VolunteerTask.prototype.complete = async function(actualHours = null) {
    this.status = 'completed';
    this.completedAt = new Date();
    if (actualHours) {
      this.actualHours = actualHours;
    }
    return this.save();
  };

  // Class methods
  VolunteerTask.findByStatus = function(status) {
    return this.findAll({ where: { status } });
  };

  VolunteerTask.findByCategory = function(categoryId) {
    return this.findAll({ where: { categoryId } });
  };

  VolunteerTask.findByCreator = function(createdBy) {
    return this.findAll({ where: { createdBy } });
  };

  VolunteerTask.findByVolunteer = function(assignedTo) {
    return this.findAll({ where: { assignedTo } });
  };

  VolunteerTask.findAvailable = function() {
    return this.findAll({ 
      where: { 
        status: 'open',
        [sequelize.Op.or]: [
          { deadline: null },
          { deadline: { [sequelize.Op.gt]: new Date() } }
        ]
      }
    });
  };

  VolunteerTask.findNearby = function(latitude, longitude, radiusKm = 10) {
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

  return VolunteerTask;
};
