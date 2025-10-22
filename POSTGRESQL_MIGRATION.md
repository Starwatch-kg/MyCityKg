# 🐘 PostgreSQL Migration Guide - MyCityKg Backend

## ✅ Миграция с MongoDB на PostgreSQL завершена!

### 🔄 **Что было изменено:**

**📦 Зависимости:**
- ❌ Удалено: `mongoose` (MongoDB ORM)
- ✅ Добавлено: `pg` (PostgreSQL driver)
- ✅ Добавлено: `sequelize` (PostgreSQL ORM)
- ✅ Добавлено: `sequelize-cli` (миграции и seeding)

**🗄️ Модели данных:**
- ✅ `User.js` - Переписан для Sequelize с PostgreSQL типами
- ✅ `Report.js` - Обновлен с поддержкой PostGIS геометрии
- ✅ `VolunteerTask.js` - Адаптирован для PostgreSQL
- ✅ `Category.js` - Новая модель для категорий
- ✅ `Comment.js` - Модель комментариев

**🔧 Конфигурация:**
- ✅ `database.js` - Конфигурация Sequelize для всех сред
- ✅ `db.js` - Инициализация подключения к PostgreSQL
- ✅ `models/index.js` - Центральная точка для всех моделей
- ✅ `.sequelizerc` - Конфигурация Sequelize CLI

**📊 Миграции и данные:**
- ✅ `20241023000001-create-initial-tables.js` - Создание всех таблиц
- ✅ `20241023000001-demo-data.js` - Демо данные для разработки

## 🚀 **Новые возможности PostgreSQL:**

### **1. Геопространственные данные (PostGIS)**
```sql
-- Поддержка точек на карте
location GEOMETRY(POINT, 4326)

-- Поиск по радиусу
SELECT * FROM reports 
WHERE ST_DWithin(location, ST_MakePoint(74.5975, 42.8746), 5000);
```

### **2. JSONB для гибких данных**
```javascript
// Волонтерская статистика
volunteerStats: {
  type: DataTypes.JSONB,
  defaultValue: {
    level: 1,
    points: 0,
    volunteerHours: 0,
    tasksCompleted: 0,
    rating: 0
  }
}
```

### **3. Массивы**
```javascript
// Массивы изображений и навыков
images: {
  type: DataTypes.ARRAY(DataTypes.STRING),
  defaultValue: []
}
```

### **4. ENUM типы**
```javascript
// Строгая типизация статусов
status: {
  type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
  defaultValue: 'pending'
}
```

## 📋 **Инструкция по установке:**

### **1. Установка PostgreSQL**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

**macOS:**
```bash
brew install postgresql postgis
brew services start postgresql
```

**Windows:**
```bash
# Скачать с https://www.postgresql.org/download/windows/
# Установить PostGIS extension
```

### **2. Создание базы данных**
```bash
# Подключиться к PostgreSQL
sudo -u postgres psql

# Создать пользователя и базы данных
CREATE USER mycitykg WITH PASSWORD 'password';
CREATE DATABASE mycitykg_dev OWNER mycitykg;
CREATE DATABASE mycitykg_test OWNER mycitykg;

# Предоставить права
GRANT ALL PRIVILEGES ON DATABASE mycitykg_dev TO mycitykg;
GRANT ALL PRIVILEGES ON DATABASE mycitykg_test TO mycitykg;

# Включить PostGIS
\c mycitykg_dev
CREATE EXTENSION postgis;
\c mycitykg_test  
CREATE EXTENSION postgis;
```

### **3. Настройка переменных окружения**
```bash
# Скопировать пример конфигурации
cp .env.example .env

# Обновить настройки базы данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mycitykg_dev
DB_USERNAME=mycitykg
DB_PASSWORD=password
DB_TEST_NAME=mycitykg_test
DB_SSL=false
```

### **4. Установка зависимостей**
```bash
npm install
```

### **5. Запуск миграций**
```bash
# Создать таблицы
npm run db:migrate

# Заполнить демо данными
npm run db:seed
```

### **6. Запуск сервера**
```bash
# Development режим
npm run dev

# Production режим
npm start
```

## 🔍 **Новые команды для работы с БД:**

```bash
# Миграции
npm run db:migrate          # Применить миграции
npm run db:migrate:undo     # Откатить последнюю миграцию

# Seeding
npm run db:seed             # Заполнить демо данными
npm run db:seed:undo        # Удалить демо данные

# Управление БД
npm run db:create           # Создать базу данных
npm run db:drop             # Удалить базу данных
```

## 📊 **Структура базы данных:**

### **Таблицы:**
1. **`users`** - Пользователи системы
2. **`categories`** - Категории жалоб и задач
3. **`reports`** - Жалобы граждан
4. **`volunteer_tasks`** - Волонтерские задачи
5. **`comments`** - Комментарии к жалобам

### **Связи:**
- `reports.userId` → `users.id` (автор жалобы)
- `reports.categoryId` → `categories.id` (категория)
- `volunteer_tasks.createdBy` → `users.id` (создатель)
- `volunteer_tasks.assignedTo` → `users.id` (исполнитель)
- `comments.userId` → `users.id` (автор комментария)
- `comments.reportId` → `reports.id` (жалоба)

### **Индексы:**
- Геопространственные индексы (GIST) для location полей
- B-tree индексы для часто используемых полей
- Уникальные индексы для email и других ключевых полей

## 🔧 **Обновление API контроллеров:**

### **Основные изменения:**
```javascript
// Было (Mongoose)
const user = await User.findById(id);

// Стало (Sequelize)
const user = await User.findByPk(id);

// Было (Mongoose)
const reports = await Report.find({ status: 'pending' });

// Стало (Sequelize)
const reports = await Report.findAll({ where: { status: 'pending' } });
```

### **Геопространственные запросы:**
```javascript
// Поиск жалоб в радиусе 5км
const nearbyReports = await Report.findAll({
  where: sequelize.where(
    sequelize.fn(
      'ST_DWithin',
      sequelize.col('location'),
      sequelize.fn('ST_MakePoint', longitude, latitude),
      5000
    ),
    true
  )
});
```

## 🎯 **Преимущества PostgreSQL:**

### **1. Производительность**
- Более быстрые сложные запросы
- Лучшая поддержка индексов
- ACID транзакции

### **2. Геопространственные возможности**
- Встроенная поддержка PostGIS
- Эффективные геопространственные запросы
- Поддержка различных проекций

### **3. Типизация данных**
- Строгая типизация
- ENUM типы
- Массивы и JSONB

### **4. Масштабируемость**
- Лучшая поддержка concurrent операций
- Репликация и шардинг
- Партиционирование таблиц

## 🔄 **Миграция данных (если нужно):**

### **Экспорт из MongoDB:**
```bash
mongoexport --db mycitykg --collection users --out users.json
mongoexport --db mycitykg --collection reports --out reports.json
```

### **Импорт в PostgreSQL:**
```javascript
// Создать скрипт миграции данных
// Преобразовать MongoDB ObjectId в PostgreSQL INTEGER
// Конвертировать геоданные в PostGIS формат
```

## 🧪 **Тестирование:**

### **Проверка подключения:**
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Подключиться к базе
psql -h localhost -U mycitykg -d mycitykg_dev
```

### **Проверка таблиц:**
```sql
-- Список таблиц
\dt

-- Структура таблицы
\d users

-- Проверка данных
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM reports;
```

## 📈 **Мониторинг производительности:**

### **Полезные запросы:**
```sql
-- Активные подключения
SELECT * FROM pg_stat_activity;

-- Размер таблиц
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats WHERE tablename = 'reports';

-- Использование индексов
SELECT * FROM pg_stat_user_indexes;
```

## 🚨 **Troubleshooting:**

### **Частые проблемы:**

1. **PostGIS не установлен:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

2. **Права доступа:**
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mycitykg;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mycitykg;
```

3. **Подключение отклонено:**
```bash
# Проверить pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Добавить: local all mycitykg md5
```

---

## 🎉 **Результат миграции:**

✅ **Backend полностью переведен на PostgreSQL**
✅ **Все модели адаптированы для Sequelize**
✅ **Поддержка геопространственных данных через PostGIS**
✅ **Миграции и seeding настроены**
✅ **Демо данные готовы для разработки**
✅ **Улучшенная производительность и типизация**

**MyCityKg теперь использует современную PostgreSQL архитектуру с полной поддержкой геопространственных операций!** 🐘🚀
