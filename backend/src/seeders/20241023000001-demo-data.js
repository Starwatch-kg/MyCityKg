'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert categories
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Дороги и тротуары',
        nameKy: 'Жолдор жана тротуарлар',
        nameEn: 'Roads and Sidewalks',
        description: 'Проблемы с дорожным покрытием, ямы, трещины',
        icon: 'https://example.com/icons/road.svg',
        color: '#FF6B35',
        isActive: true,
        priority: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Освещение',
        nameKy: 'Жарык',
        nameEn: 'Lighting',
        description: 'Неработающие фонари, плохое освещение',
        icon: 'https://example.com/icons/light.svg',
        color: '#F7931E',
        isActive: true,
        priority: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Мусор и санитария',
        nameKy: 'Таштанды жана санитария',
        nameEn: 'Waste and Sanitation',
        description: 'Переполненные контейнеры, несанкционированные свалки',
        icon: 'https://example.com/icons/trash.svg',
        color: '#4ECDC4',
        isActive: true,
        priority: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Парки и зеленые зоны',
        nameKy: 'Парктар жана жашыл аймактар',
        nameEn: 'Parks and Green Areas',
        description: 'Состояние парков, поврежденные деревья',
        icon: 'https://example.com/icons/park.svg',
        color: '#45B7D1',
        isActive: true,
        priority: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Транспорт',
        nameKy: 'Транспорт',
        nameEn: 'Transportation',
        description: 'Общественный транспорт, парковка',
        icon: 'https://example.com/icons/transport.svg',
        color: '#96CEB4',
        isActive: true,
        priority: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert demo users
    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@mycitykg.com',
        password: hashedPassword,
        firstName: 'Админ',
        lastName: 'Системы',
        phone: '+996555123456',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        volunteerStats: JSON.stringify({
          level: 5,
          points: 1000,
          volunteerHours: 50,
          tasksCompleted: 25,
          rating: 4.8
        }),
        fcmTokens: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'moderator@mycitykg.com',
        password: hashedPassword,
        firstName: 'Модератор',
        lastName: 'Главный',
        phone: '+996555234567',
        role: 'moderator',
        isActive: true,
        isEmailVerified: true,
        volunteerStats: JSON.stringify({
          level: 3,
          points: 500,
          volunteerHours: 30,
          tasksCompleted: 15,
          rating: 4.5
        }),
        fcmTokens: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'volunteer@mycitykg.com',
        password: hashedPassword,
        firstName: 'Волонтер',
        lastName: 'Активный',
        phone: '+996555345678',
        role: 'volunteer',
        isActive: true,
        isEmailVerified: true,
        location: Sequelize.fn('ST_MakePoint', 74.5975, 42.8746), // Bishkek coordinates
        address: 'г. Бишкек, ул. Чуй, 123',
        volunteerStats: JSON.stringify({
          level: 2,
          points: 250,
          volunteerHours: 20,
          tasksCompleted: 10,
          rating: 4.2
        }),
        fcmTokens: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@mycitykg.com',
        password: hashedPassword,
        firstName: 'Пользователь',
        lastName: 'Обычный',
        phone: '+996555456789',
        role: 'user',
        isActive: true,
        isEmailVerified: true,
        location: Sequelize.fn('ST_MakePoint', 74.6057, 42.8821),
        address: 'г. Бишкек, ул. Манаса, 45',
        volunteerStats: JSON.stringify({
          level: 1,
          points: 50,
          volunteerHours: 5,
          tasksCompleted: 2,
          rating: 4.0
        }),
        fcmTokens: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert demo reports
    await queryInterface.bulkInsert('reports', [
      {
        title: 'Большая яма на дороге',
        description: 'На улице Чуй образовалась большая яма, которая мешает движению транспорта и может повредить автомобили.',
        location: Sequelize.fn('ST_MakePoint', 74.5975, 42.8746),
        address: 'г. Бишкек, ул. Чуй, возле ТЦ "Вефа"',
        categoryId: 1, // Roads and Sidewalks
        userId: 4, // Regular user
        status: 'pending',
        priority: 'high',
        images: '{https://example.com/images/pothole1.jpg,https://example.com/images/pothole2.jpg}',
        isAnonymous: false,
        upvotes: 15,
        downvotes: 2,
        viewsCount: 45,
        metadata: JSON.stringify({
          reportedVia: 'mobile_app',
          weather: 'sunny',
          timeOfDay: 'morning'
        }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date()
      },
      {
        title: 'Не работает уличный фонарь',
        description: 'Фонарь на перекрестке не работает уже неделю, создает опасность для пешеходов в темное время суток.',
        location: Sequelize.fn('ST_MakePoint', 74.6057, 42.8821),
        address: 'г. Бишкек, пересечение ул. Манаса и ул. Киевская',
        categoryId: 2, // Lighting
        userId: null, // Anonymous report
        status: 'in_progress',
        priority: 'medium',
        images: '{https://example.com/images/streetlight.jpg}',
        isAnonymous: true,
        upvotes: 8,
        downvotes: 0,
        viewsCount: 23,
        metadata: JSON.stringify({
          reportedVia: 'web_app',
          weather: 'cloudy',
          timeOfDay: 'evening'
        }),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date()
      },
      {
        title: 'Переполненный мусорный контейнер',
        description: 'Контейнер переполнен, мусор разбросан вокруг, привлекает бродячих животных.',
        location: Sequelize.fn('ST_MakePoint', 74.5900, 42.8700),
        address: 'г. Бишкек, микрорайон Джал, 15-й дом',
        categoryId: 3, // Waste and Sanitation
        userId: 3, // Volunteer
        status: 'resolved',
        priority: 'medium',
        images: '{https://example.com/images/trash1.jpg}',
        isAnonymous: false,
        upvotes: 12,
        downvotes: 1,
        viewsCount: 34,
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        metadata: JSON.stringify({
          reportedVia: 'mobile_app',
          weather: 'rainy',
          timeOfDay: 'afternoon'
        }),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      }
    ], {});

    // Insert demo volunteer tasks
    await queryInterface.bulkInsert('volunteer_tasks', [
      {
        title: 'Уборка парка Ататюрк',
        description: 'Организуем субботник по уборке парка Ататюрк. Нужны волонтеры для сбора мусора и приведения территории в порядок.',
        location: Sequelize.fn('ST_MakePoint', 74.6100, 42.8800),
        address: 'г. Бишкек, парк Ататюрк',
        categoryId: 4, // Parks and Green Areas
        createdBy: 2, // Moderator
        assignedTo: 3, // Volunteer
        status: 'assigned',
        priority: 'medium',
        difficulty: 'easy',
        estimatedHours: 4.0,
        maxVolunteers: 10,
        currentVolunteers: 3,
        requiredSkills: '{physical_work,teamwork}',
        images: '{https://example.com/images/park_cleanup.jpg}',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        metadata: JSON.stringify({
          tools_provided: true,
          meeting_point: 'Главный вход в парк',
          contact_person: 'Айгуль Сманова'
        }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date()
      },
      {
        title: 'Покраска остановки общественного транспорта',
        description: 'Требуется покрасить остановку на ул. Манаса. Краска и инструменты предоставляются.',
        location: Sequelize.fn('ST_MakePoint', 74.6000, 42.8750),
        address: 'г. Бишкек, ул. Манаса, остановка "Филармония"',
        categoryId: 5, // Transportation
        createdBy: 1, // Admin
        assignedTo: null,
        status: 'open',
        priority: 'low',
        difficulty: 'medium',
        estimatedHours: 6.0,
        maxVolunteers: 3,
        currentVolunteers: 0,
        requiredSkills: '{painting,manual_work}',
        images: '{https://example.com/images/bus_stop.jpg}',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        metadata: JSON.stringify({
          tools_provided: true,
          safety_equipment: true,
          experience_required: false
        }),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      }
    ], {});

    // Insert demo comments
    await queryInterface.bulkInsert('comments', [
      {
        content: 'Подтверждаю, яма действительно большая и опасная!',
        userId: 3, // Volunteer
        reportId: 1,
        parentId: null,
        isEdited: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        content: 'Спасибо за быстрое решение проблемы!',
        userId: 4, // Regular user
        reportId: 3,
        parentId: null,
        isEdited: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        content: 'Готов помочь с уборкой парка в выходные!',
        userId: 4, // Regular user
        reportId: 1, // This would be linked to task comments in real app
        parentId: null,
        isEdited: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
    await queryInterface.bulkDelete('volunteer_tasks', null, {});
    await queryInterface.bulkDelete('reports', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};
