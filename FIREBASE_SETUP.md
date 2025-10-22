# 🔥 Firebase Integration Guide для MyCityKg

## Шаг 1: Настройка Firebase проекта

### 1.1 Создание проекта Firebase
1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Проект `mycitykg` уже создан
3. Включите необходимые сервисы:
   - Authentication
   - Firestore Database
   - Storage
   - Cloud Messaging
   - Analytics
   - Crashlytics
   - Remote Config

### 1.2 Настройка Authentication
1. В Firebase Console → Authentication → Sign-in method
2. Включите провайдеры:
   - Email/Password ✅
   - Google (опционально)
   - Anonymous (для анонимных жалоб) ✅

### 1.3 Настройка Firestore Database
1. В Firebase Console → Firestore Database
2. Создайте базу данных в production mode
3. Настройте правила безопасности:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reports are readable by all, writable by authenticated users
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.role in ['moderator', 'admin']);
    }
    
    // Volunteer tasks
    match /volunteer_tasks/{taskId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.organizerId || 
         request.auth.token.role in ['moderator', 'admin']);
    }
  }
}
```

### 1.4 Настройка Storage
1. В Firebase Console → Storage
2. Настройте правила безопасности:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Шаг 2: Получение конфигурационных файлов

### 2.1 Android (google-services.json)
1. В Firebase Console → Project Settings → General
2. Добавьте Android app с package name: `com.mycitykg.app`
3. Скачайте `google-services.json`
4. Замените файл: `android/app/google-services.json`

### 2.2 iOS (GoogleService-Info.plist)
1. В Firebase Console → Project Settings → General
2. Добавьте iOS app с Bundle ID: `com.mycitykg.app`
3. Скачайте `GoogleService-Info.plist`
4. Замените файл: `ios/Runner/GoogleService-Info.plist`

### 2.3 Web
1. В Firebase Console → Project Settings → General
2. Добавьте Web app
3. Скопируйте конфигурацию и обновите:
   - `lib/firebase_options.dart`
   - `web/firebase-messaging-sw.js`

## Шаг 3: Обновление API ключей

### 3.1 Обновите firebase_options.dart
```dart
static const FirebaseOptions web = FirebaseOptions(
  apiKey: 'YOUR_WEB_API_KEY',
  appId: 'YOUR_WEB_APP_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  projectId: 'mycitykg',
  authDomain: 'mycitykg.firebaseapp.com',
  storageBucket: 'mycitykg.appspot.com',
  measurementId: 'YOUR_MEASUREMENT_ID',
);

static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'YOUR_ANDROID_API_KEY',
  appId: 'YOUR_ANDROID_APP_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  projectId: 'mycitykg',
  storageBucket: 'mycitykg.appspot.com',
);

static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'YOUR_IOS_API_KEY',
  appId: 'YOUR_IOS_APP_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  projectId: 'mycitykg',
  storageBucket: 'mycitykg.appspot.com',
  iosBundleId: 'com.mycitykg.app',
);
```

## Шаг 4: Настройка Cloud Messaging

### 4.1 Android
1. В `android/app/src/main/AndroidManifest.xml` добавьте:
```xml
<service
    android:name=".java.MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### 4.2 iOS
1. В Xcode откройте `ios/Runner.xcworkspace`
2. Добавьте Push Notifications capability
3. Загрузите APNs ключ в Firebase Console

### 4.3 Web
1. Файл `web/firebase-messaging-sw.js` уже создан
2. Обновите конфигурацию Firebase в этом файле

## Шаг 5: Настройка Remote Config

### 5.1 Параметры по умолчанию
В Firebase Console → Remote Config добавьте параметры:

| Ключ | Значение | Описание |
|------|----------|----------|
| `app_version` | `1.0.0` | Текущая версия приложения |
| `maintenance_mode` | `false` | Режим обслуживания |
| `api_base_url` | `https://api.mycitykg.com` | Базовый URL API |
| `max_image_size` | `5242880` | Максимальный размер изображения (5MB) |
| `enable_analytics` | `true` | Включить аналитику |
| `enable_crashlytics` | `true` | Включить Crashlytics |

## Шаг 6: Настройка App Check (Production)

### 6.1 Web (reCAPTCHA)
1. В Firebase Console → App Check
2. Зарегистрируйте веб-приложение
3. Получите reCAPTCHA v3 site key
4. Обновите в `firebase_service.dart`:
```dart
webProvider: ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
```

### 6.2 Android (Play Integrity)
1. В Firebase Console → App Check
2. Зарегистрируйте Android приложение
3. Включите Play Integrity API

### 6.3 iOS (App Attest)
1. В Firebase Console → App Check
2. Зарегистрируйте iOS приложение
3. App Attest включается автоматически

## Шаг 7: Тестирование

### 7.1 Проверка инициализации
```bash
flutter run -d chrome --web-port=8080
```

### 7.2 Проверка логов
Откройте Developer Tools и проверьте:
- Firebase инициализирован
- Remote Config загружен
- FCM токен получен
- Уведомления работают

### 7.3 Тестирование уведомлений
1. В Firebase Console → Cloud Messaging
2. Создайте тестовое уведомление
3. Отправьте на FCM токен

## Шаг 8: Безопасность

### 8.1 Firestore Security Rules
- Обновите правила безопасности для production
- Ограничьте доступ к данным пользователей
- Настройте роли (user, volunteer, moderator, admin)

### 8.2 Storage Security Rules
- Ограничьте размер загружаемых файлов
- Проверяйте типы файлов
- Настройте квоты

### 8.3 App Check
- Включите App Check для всех сервисов в production
- Настройте enforcement для критических API

## Готовые файлы ✅

- ✅ `lib/firebase_options.dart` - Конфигурация Firebase
- ✅ `lib/core/services/firebase_service.dart` - Сервис Firebase
- ✅ `android/app/google-services.json` - Android конфигурация (demo)
- ✅ `ios/Runner/GoogleService-Info.plist` - iOS конфигурация (demo)
- ✅ `web/firebase-messaging-sw.js` - Service Worker для уведомлений
- ✅ `android/app/build.gradle.kts` - Android build конфигурация
- ✅ `web/index.html` - Web HTML с Firebase SDK

## Следующие шаги

1. **Получите реальные API ключи** из Firebase Console
2. **Замените demo конфигурации** на реальные
3. **Настройте правила безопасности** для production
4. **Протестируйте все функции** Firebase
5. **Настройте мониторинг** и аналитику

Firebase интеграция готова! 🚀
