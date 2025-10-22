# MyCityKg - Мобильное приложение для улучшения городской инфраструктуры

[![GitHub](https://img.shields.io/badge/GitHub-Starwatch--kg%2FMyCityKg-blue?logo=github)](https://github.com/Starwatch-kg/MyCityKg)
[![Flutter](https://img.shields.io/badge/Flutter-3.35.6-blue?logo=flutter)](https://flutter.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/github/license/Starwatch-kg/MyCityKg)](https://github.com/Starwatch-kg/MyCityKg/blob/main/LICENSE)

## 📱 Описание проекта

MyCityKg - это мобильное приложение для Android и iOS, которое позволяет гражданам сообщать о проблемах в городской инфраструктуре и участвовать в волонтерских программах по улучшению города.

### 🎯 Основные функции

**Для граждан:**
- 📸 Фотографирование проблем инфраструктуры
- 📍 Автоматическое определение геолокации
- 📝 Подробное описание проблемы
- 🔄 Отслеживание статуса жалобы
- 🌿 Информация об экологии района
- 🔔 Push-уведомления о статусе
- 🗣️ Анонимная подача жалоб

**Для волонтеров:**
- 👥 Регистрация и профили волонтеров
- 📋 Просмотр доступных задач
- ✅ Запись на выполнение задач
- 📊 Отслеживание выполненных задач
- ⭐ Система рейтингов и отзывов
- 🏆 Достижения и награды

## 🛠 Технологический стек

### Frontend (Mobile App)
- **Flutter** - кроссплатформенная разработка
- **Dart** - язык программирования
- **Firebase Auth** - аутентификация
- **Google Maps SDK** - карты и геолокация
- **Image Picker** - работа с фотографиями
- **Geolocator** - определение местоположения

### Backend (Server)
- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация
- **Multer** - загрузка файлов

### Интеграции
- **Firebase Cloud Messaging** - push-уведомления
- **Google Maps API** - карты и геокодирование
- **OpenWeatherMap API** - экологические данные
- **Cloudinary** - хранение изображений

## 📁 Структура проекта

```
MyCityKg/
├── mobile_app/          # Flutter приложение
│   ├── lib/
│   │   ├── screens/     # Экраны приложения
│   │   ├── widgets/     # Переиспользуемые виджеты
│   │   ├── models/      # Модели данных
│   │   ├── services/    # Сервисы и API
│   │   └── utils/       # Утилиты
│   ├── android/         # Android конфигурация
│   ├── ios/            # iOS конфигурация
│   └── pubspec.yaml    # Зависимости Flutter
├── backend/            # Node.js сервер
│   ├── src/
│   │   ├── controllers/ # Контроллеры API
│   │   ├── models/      # Модели MongoDB
│   │   ├── routes/      # Маршруты API
│   │   ├── middleware/  # Промежуточное ПО
│   │   └── services/    # Бизнес-логика
│   ├── config/         # Конфигурация
│   └── package.json    # Зависимости Node.js
├── docs/               # Документация
└── docker-compose.yml  # Docker конфигурация
```

## 🚀 Быстрый старт

### Предварительные требования
- Flutter SDK (3.0+)
- Node.js (18+)
- MongoDB
- Android Studio / Xcode
- Firebase проект

### Установка

1. **Клонирование репозитория:**
```bash
git clone https://github.com/your-username/MyCityKg.git
cd MyCityKg
```

2. **Настройка backend:**
```bash
cd backend
npm install
cp .env.example .env
# Настройте переменные окружения в .env
npm run dev
```

3. **Настройка мобильного приложения:**
```bash
cd mobile_app
flutter pub get
flutter run
```

## 🔧 Конфигурация

### Firebase Setup
1. Создайте проект в Firebase Console
2. Добавьте Android и iOS приложения
3. Скачайте конфигурационные файлы:
   - `google-services.json` для Android
   - `GoogleService-Info.plist` для iOS
4. Настройте Authentication и Cloud Messaging

### Google Maps API
1. Получите API ключи в Google Cloud Console
2. Включите необходимые API:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API

## 📱 Основные экраны

1. **Главный экран** - карта с отмеченными проблемами
2. **Подача жалобы** - форма с фото и описанием
3. **Мои жалобы** - список поданных жалоб
4. **Волонтерство** - доступные задачи для волонтеров
5. **Профиль** - настройки пользователя
6. **Экология** - данные о качестве воздуха и воды

## 🔐 Безопасность

- JWT токены для аутентификации
- Валидация данных на сервере
- Защита от SQL инъекций
- Rate limiting для API
- Шифрование чувствительных данных

## 📊 Мониторинг и аналитика

- Firebase Analytics
- Crash reporting
- Performance monitoring
- User behavior tracking

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 📞 Контакты

- Email: support@mycitykg.com
- Telegram: @mycitykg_support
- Website: https://mycitykg.com
