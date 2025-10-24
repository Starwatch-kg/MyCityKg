const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *         firstName:
 *           type: string
 *           description: Имя пользователя
 *         lastName:
 *           type: string
 *           description: Фамилия пользователя
 *         phone:
 *           type: string
 *           description: Номер телефона
 *         avatar:
 *           type: string
 *           description: URL аватара
 *         role:
 *           type: string
 *           enum: [user, volunteer, moderator, admin]
 *           description: Роль пользователя
 *         isActive:
 *           type: boolean
 *           description: Активен ли пользователь
 *         isEmailVerified:
 *           type: boolean
 *           description: Подтвержден ли email
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
 *           description: Адрес пользователя
 *         volunteerStats:
 *           type: object
 *           properties:
 *             level:
 *               type: integer
 *             points:
 *               type: integer
 *             volunteerHours:
 *               type: integer
 *             tasksCompleted:
 *               type: integer
 *             rating:
 *               type: number
 *         fcmTokens:
 *           type: array
 *           items:
 *             type: string
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Некорректный email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: 'Пароль должен содержать от 6 до 100 символов'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Имя обязательно'
        },
        len: {
          args: [2, 50],
          msg: 'Имя должно содержать от 2 до 50 символов'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Фамилия обязательна'
        },
        len: {
          args: [2, 50],
          msg: 'Фамилия должна содержать от 2 до 50 символов'
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Некорректный номер телефона'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Некорректный URL аватара'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'volunteer', 'moderator', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('location');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('location', value ? JSON.stringify(value) : null);
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    volunteerStats: {
      type: DataTypes.TEXT,
      defaultValue: '{"level":1,"points":0,"volunteerHours":0,"tasksCompleted":0,"rating":0}',
      get() {
        const value = this.getDataValue('volunteerStats');
        return value ? JSON.parse(value) : {
          level: 1,
          points: 0,
          volunteerHours: 0,
          tasksCompleted: 0,
          rating: 0
        };
      },
      set(value) {
        this.setDataValue('volunteerStats', JSON.stringify(value || {
          level: 1,
          points: 0,
          volunteerHours: 0,
          tasksCompleted: 0,
          rating: 0
        }));
      }
    },
    fcmTokens: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('fcmTokens');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('fcmTokens', JSON.stringify(value || []));
      }
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.generateAuthToken = function() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email, 
        role: this.role 
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn 
      }
    );
  };

  User.prototype.generateRefreshToken = function() {
    return jwt.sign(
      { 
        id: this.id, 
        type: 'refresh' 
      },
      config.jwt.refreshSecret,
      { 
        expiresIn: config.jwt.refreshExpiresIn 
      }
    );
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    return values;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findActiveUsers = function() {
    return this.findAll({ where: { isActive: true } });
  };

  User.findByRole = function(role) {
    return this.findAll({ where: { role } });
  };

  return User;
};
