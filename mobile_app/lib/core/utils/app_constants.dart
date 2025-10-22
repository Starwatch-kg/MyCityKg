class AppConstants {
  // App Info
  static const String appName = 'MyCityKg';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Мобильное приложение для улучшения городской инфраструктуры';
  
  // API Configuration
  static const String baseUrl = 'https://api.mycitykg.com';
  static const String apiVersion = 'v1';
  static const String apiBaseUrl = '$baseUrl/api/$apiVersion';
  
  // Local Storage Keys
  static const String settingsBox = 'settings';
  static const String cacheBox = 'cache';
  static const String userBox = 'user';
  static const String reportsBox = 'reports';
  
  // Preferences Keys
  static const String themeKey = 'theme_mode';
  static const String localeKey = 'locale';
  static const String firstLaunchKey = 'first_launch';
  static const String notificationsEnabledKey = 'notifications_enabled';
  static const String locationPermissionKey = 'location_permission';
  static const String cameraPermissionKey = 'camera_permission';
  
  // Firebase Collections
  static const String usersCollection = 'users';
  static const String reportsCollection = 'reports';
  static const String volunteersCollection = 'volunteers';
  static const String tasksCollection = 'tasks';
  static const String commentsCollection = 'comments';
  static const String ratingsCollection = 'ratings';
  
  // Image Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int imageQuality = 85;
  static const double maxImageWidth = 1920;
  static const double maxImageHeight = 1080;
  
  // Map Configuration
  static const double defaultLatitude = 42.8746;
  static const double defaultLongitude = 74.5698;
  static const double defaultZoom = 12.0;
  static const double maxZoom = 20.0;
  static const double minZoom = 5.0;
  
  // Validation Rules
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 50;
  static const int minDescriptionLength = 10;
  static const int maxDescriptionLength = 500;
  static const int maxTitleLength = 100;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache Duration
  static const Duration shortCacheDuration = Duration(minutes: 5);
  static const Duration mediumCacheDuration = Duration(hours: 1);
  static const Duration longCacheDuration = Duration(days: 1);
  
  // Animation Durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);
  
  // Network Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
  
  // Report Categories
  static const List<String> reportCategories = [
    'road',
    'lighting',
    'waste',
    'park',
    'building',
    'water',
    'transport',
    'other',
  ];
  
  // Report Priorities
  static const List<String> reportPriorities = [
    'low',
    'medium',
    'high',
    'critical',
  ];
  
  // Report Statuses
  static const List<String> reportStatuses = [
    'new',
    'in_progress',
    'resolved',
    'rejected',
  ];
  
  // Volunteer Task Types
  static const List<String> volunteerTaskTypes = [
    'cleaning',
    'repair',
    'painting',
    'planting',
    'monitoring',
    'education',
    'other',
  ];
  
  // Volunteer Statuses
  static const List<String> volunteerStatuses = [
    'active',
    'pending',
    'completed',
    'cancelled',
  ];
  
  // Supported Languages
  static const List<String> supportedLanguages = [
    'ru',
    'ky',
    'en',
  ];
  
  // Default Values
  static const String defaultLanguage = 'ru';
  static const String defaultCountry = 'KG';
  static const String defaultCurrency = 'KGS';
  static const String defaultTimeZone = 'Asia/Bishkek';
  
  // Contact Information
  static const String supportEmail = 'support@mycitykg.com';
  static const String supportPhone = '+996 XXX XXX XXX';
  static const String websiteUrl = 'https://mycitykg.com';
  static const String privacyPolicyUrl = 'https://mycitykg.com/privacy';
  static const String termsOfServiceUrl = 'https://mycitykg.com/terms';
  
  // Social Media
  static const String facebookUrl = 'https://facebook.com/mycitykg';
  static const String instagramUrl = 'https://instagram.com/mycitykg';
  static const String telegramUrl = 'https://t.me/mycitykg';
  
  // Error Messages
  static const String networkErrorMessage = 'Проблемы с подключением к интернету';
  static const String serverErrorMessage = 'Ошибка сервера. Попробуйте позже';
  static const String unknownErrorMessage = 'Произошла неизвестная ошибка';
  static const String validationErrorMessage = 'Проверьте правильность введенных данных';
  
  // Success Messages
  static const String reportSubmittedMessage = 'Жалоба успешно отправлена';
  static const String profileUpdatedMessage = 'Профиль успешно обновлен';
  static const String passwordChangedMessage = 'Пароль успешно изменен';
  
  // File Paths
  static const String imagesPath = 'assets/images/';
  static const String iconsPath = 'assets/icons/';
  static const String animationsPath = 'assets/animations/';
  static const String fontsPath = 'assets/fonts/';
  
  // Regular Expressions
  static const String emailRegex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phoneRegex = r'^\+?[1-9]\d{1,14}$';
  static const String passwordRegex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$';
}
