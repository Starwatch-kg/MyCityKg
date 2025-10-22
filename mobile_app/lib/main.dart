import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app.dart';
import 'core/services/notification_service.dart';
import 'core/services/firebase_service.dart';
import 'core/utils/app_constants.dart';
import 'firebase_options.dart';

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  print('Handling a background message: ${message.messageId}');
  
  // Handle background notification
  await NotificationService.showNotification(
    title: message.notification?.title ?? 'MyCityKg',
    body: message.notification?.body ?? 'Новое уведомление',
    payload: message.data.toString(),
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize Firebase with options
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    
    // Initialize Firebase Crashlytics
    FlutterError.onError = (errorDetails) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    };
    
    // Initialize Firebase Analytics
    FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    
    // Initialize Hive
    await Hive.initFlutter();
    await Hive.openBox(AppConstants.settingsBox);
    await Hive.openBox(AppConstants.cacheBox);
    
    // Initialize Firebase Messaging
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Initialize services
    await NotificationService.initialize();
    await FirebaseService.initialize();
    
    runApp(
      const ProviderScope(
        child: MyCityKgApp(),
      ),
    );
  } catch (e) {
    print('Error initializing app: $e');
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  'Ошибка инициализации приложения',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text('$e'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => main(),
                  child: const Text('Попробовать снова'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
