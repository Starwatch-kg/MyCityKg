'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable PostGIS extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'volunteer', 'moderator', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      volunteerStats: {
        type: Sequelize.JSONB,
        defaultValue: {
          level: 1,
          points: 0,
          volunteerHours: 0,
          tasksCompleted: 0,
          rating: 0
        }
      },
      fcmTokens: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create categories table
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nameKy: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nameEn: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create reports table
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium',
        allowNull: false
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      upvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      downvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      viewsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create volunteer_tasks table
    await queryInterface.createTable('volunteer_tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('open', 'assigned', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open',
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium',
        allowNull: false
      },
      estimatedHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      actualHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      maxVolunteers: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      currentVolunteers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      requiredSkills: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create comments table
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reports',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['isActive']);
    await queryInterface.addIndex('users', ['location'], { using: 'gist' });

    await queryInterface.addIndex('categories', ['isActive']);
    await queryInterface.addIndex('categories', ['priority']);

    await queryInterface.addIndex('reports', ['status']);
    await queryInterface.addIndex('reports', ['priority']);
    await queryInterface.addIndex('reports', ['categoryId']);
    await queryInterface.addIndex('reports', ['userId']);
    await queryInterface.addIndex('reports', ['location'], { using: 'gist' });
    await queryInterface.addIndex('reports', ['createdAt']);
    await queryInterface.addIndex('reports', ['isAnonymous']);

    await queryInterface.addIndex('volunteer_tasks', ['status']);
    await queryInterface.addIndex('volunteer_tasks', ['priority']);
    await queryInterface.addIndex('volunteer_tasks', ['difficulty']);
    await queryInterface.addIndex('volunteer_tasks', ['categoryId']);
    await queryInterface.addIndex('volunteer_tasks', ['createdBy']);
    await queryInterface.addIndex('volunteer_tasks', ['assignedTo']);
    await queryInterface.addIndex('volunteer_tasks', ['location'], { using: 'gist' });
    await queryInterface.addIndex('volunteer_tasks', ['deadline']);
    await queryInterface.addIndex('volunteer_tasks', ['createdAt']);

    await queryInterface.addIndex('comments', ['reportId']);
    await queryInterface.addIndex('comments', ['userId']);
    await queryInterface.addIndex('comments', ['parentId']);
    await queryInterface.addIndex('comments', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
    await queryInterface.dropTable('volunteer_tasks');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
    
    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reports_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reports_priority";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_volunteer_tasks_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_volunteer_tasks_priority";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_volunteer_tasks_difficulty";');
  }
};
