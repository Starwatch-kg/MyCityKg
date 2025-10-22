# 🔥 Firebase Configuration Update Guide

## ✅ Обновлено

**Android App ID:** `1:544289183767:android:825cd13cceef257c482452`

Файлы обновлены:
- ✅ `mobile_app/lib/firebase_options.dart` - Android appId
- ✅ `mobile_app/android/app/google-services.json` - mobilesdk_app_id

## 🔑 Необходимо получить дополнительные конфигурации

### 1. Android API Key
**Где найти:** Firebase Console → Project Settings → General → Your apps → Android app → Config

**Что нужно:**
- Android API Key (заменить `AIzaSyDemoKey-Replace-With-Your-Android-API-Key`)

**Где обновить:**
```dart
// mobile_app/lib/firebase_options.dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'YOUR_REAL_ANDROID_API_KEY_HERE', // ⬅️ Обновить здесь
  appId: '1:544289183767:android:825cd13cceef257c482452', // ✅ Уже обновлено
  // ...
);
```

```json
// mobile_app/android/app/google-services.json
"api_key": [
  {
    "current_key": "YOUR_REAL_ANDROID_API_KEY_HERE" // ⬅️ Обновить здесь
  }
]
```

### 2. OAuth Client ID
**Где найти:** Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration

**Что нужно:**
- OAuth 2.0 Client ID

**Где обновить:**
```json
// mobile_app/android/app/google-services.json
"oauth_client": [
  {
    "client_id": "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com", // ⬅️ Обновить
    "client_type": 3
  }
]
```

### 3. iOS Configuration
**Если планируется iOS версия:**

**Что нужно получить:**
- iOS App ID
- iOS API Key
- iOS Bundle ID configuration

**Где обновить:**
```dart
// mobile_app/lib/firebase_options.dart
static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'YOUR_IOS_API_KEY',
  appId: 'YOUR_IOS_APP_ID',
  // ...
);
```

### 4. Web Configuration
**Для веб-версии:**

**Что нужно получить:**
- Web App ID
- Web API Key
- Auth Domain
- Measurement ID (для Analytics)

**Где обновить:**
```dart
// mobile_app/lib/firebase_options.dart
static const FirebaseOptions web = FirebaseOptions(
  apiKey: 'YOUR_WEB_API_KEY',
  appId: 'YOUR_WEB_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
  // ...
);
```

```javascript
// mobile_app/web/firebase-messaging-sw.js
firebase.initializeApp({
  apiKey: 'YOUR_WEB_API_KEY',
  appId: 'YOUR_WEB_APP_ID',
  // ...
});
```

## 📋 Пошаговая инструкция

### Шаг 1: Откройте Firebase Console
1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `mycitykg`

### Шаг 2: Получите Android конфигурацию
1. Project Settings → General
2. В разделе "Your apps" найдите Android приложение
3. Нажмите на значок настроек (⚙️)
4. Скачайте новый `google-services.json`
5. Замените файл `mobile_app/android/app/google-services.json`

### Шаг 3: Обновите firebase_options.dart
1. Скопируйте API ключи из Firebase Console
2. Обновите соответствующие поля в `mobile_app/lib/firebase_options.dart`

### Шаг 4: Проверьте настройки
```bash
cd mobile_app
flutter clean
flutter pub get
flutter run -d chrome  # Для веб-версии
```

## 🔐 Безопасность

**⚠️ Важно:**
- Никогда не коммитьте реальные API ключи в публичный репозиторий
- Используйте environment variables для production
- Настройте Firebase Security Rules

**Рекомендуемая структура для production:**
```dart
// Используйте environment variables
static const FirebaseOptions android = FirebaseOptions(
  apiKey: String.fromEnvironment('ANDROID_API_KEY', 
    defaultValue: 'demo-key'),
  // ...
);
```

## ✅ После обновления конфигурации

1. **Тестирование:**
   ```bash
   flutter run -d android  # Тест на Android
   flutter run -d chrome   # Тест на Web
   ```

2. **Проверка Firebase подключения:**
   - Откройте приложение
   - Проверьте логи на успешную инициализацию Firebase
   - Попробуйте зарегистрироваться/войти

3. **Коммит изменений:**
   ```bash
   git add .
   git commit -m "🔥 Update Firebase Android App ID and configuration"
   git push origin main
   ```

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте правильность package name: `com.mycitykg.app`
2. Убедитесь, что SHA-1/SHA-256 fingerprints добавлены в Firebase Console
3. Проверьте, что все Firebase сервисы включены в проекте

---

**Текущий статус:** ✅ Android App ID обновлен, требуются API ключи для полной настройки
