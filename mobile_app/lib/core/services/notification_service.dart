import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart';

import 'firebase_service.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _androidChannel =
      AndroidNotificationChannel(
    'mycitykg_channel',
    'MyCityKg Notifications',
    description: 'Уведомления от приложения MyCityKg',
    importance: Importance.high,
    playSound: true,
  );

  static Future<void> initialize() async {
    try {
      // Request notification permissions
      await _requestPermissions();

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Initialize Firebase messaging
      await _initializeFirebaseMessaging();

      print('Notification service initialized successfully');
    } catch (e) {
      print('Error initializing notification service: $e');
      await FirebaseService.crashlytics.recordError(e, null);
    }
  }

  static Future<void> _requestPermissions() async {
    // Request notification permission
    final notificationStatus = await Permission.notification.request();
    
    if (notificationStatus.isDenied) {
      print('Notification permission denied');
    }

    // Request Firebase messaging permission
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      print('Firebase messaging permission denied');
    }
  }

  static Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initializationSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel for Android
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);
  }

  static Future<void> _initializeFirebaseMessaging() async {
    final messaging = FirebaseMessaging.instance;

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Handle notification tap when app is terminated
    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }

    // Get and save FCM token
    final token = await messaging.getToken();
    if (token != null) {
      await _saveFCMToken(token);
    }

    // Listen for token refresh
    messaging.onTokenRefresh.listen(_saveFCMToken);
  }

  static Future<void> _firebaseMessagingBackgroundHandler(
      RemoteMessage message) async {
    print('Handling background message: ${message.messageId}');
    await _showLocalNotification(message);
  }

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('Handling foreground message: ${message.messageId}');
    
    // Show local notification when app is in foreground
    await _showLocalNotification(message);
    
    // Log analytics event
    await FirebaseService.logEvent('notification_received', parameters: {
      'message_id': message.messageId ?? '',
      'title': message.notification?.title ?? '',
      'body': message.notification?.body ?? '',
    });
  }

  static Future<void> _handleNotificationTap(RemoteMessage message) async {
    print('Notification tapped: ${message.messageId}');
    
    // Log analytics event
    await FirebaseService.logEvent('notification_opened', parameters: {
      'message_id': message.messageId ?? '',
      'title': message.notification?.title ?? '',
      'body': message.notification?.body ?? '',
    });

    // Handle navigation based on notification data
    await _handleNotificationNavigation(message.data);
  }

  static Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const androidDetails = AndroidNotificationDetails(
      'mycitykg_channel',
      'MyCityKg Notifications',
      channelDescription: 'Уведомления от приложения MyCityKg',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      notification.title,
      notification.body,
      notificationDetails,
      payload: message.data.toString(),
    );
  }

  static void _onNotificationTapped(NotificationResponse response) {
    print('Local notification tapped: ${response.payload}');
    
    // Parse payload and handle navigation
    if (response.payload != null) {
      // Handle navigation based on payload
      _handleLocalNotificationNavigation(response.payload!);
    }
  }

  static Future<void> _saveFCMToken(String token) async {
    try {
      print('FCM Token: $token');
      
      // Save token to user document in Firestore
      final user = FirebaseService.auth.currentUser;
      if (user != null) {
        await FirebaseService.updateDocument('users', user.uid, {
          'fcmToken': token,
          'platform': defaultTargetPlatform.name,
        });
      }
      
      // Save token locally for offline access
      // You can use SharedPreferences or Hive here
      
    } catch (e) {
      print('Error saving FCM token: $e');
      await FirebaseService.crashlytics.recordError(e, null);
    }
  }

  static Future<void> _handleNotificationNavigation(
      Map<String, dynamic> data) async {
    // Handle navigation based on notification data
    final type = data['type'] as String?;
    final id = data['id'] as String?;

    switch (type) {
      case 'report_update':
        // Navigate to report details
        print('Navigate to report: $id');
        break;
      case 'volunteer_task':
        // Navigate to volunteer task
        print('Navigate to volunteer task: $id');
        break;
      case 'message':
        // Navigate to messages
        print('Navigate to messages');
        break;
      default:
        // Navigate to home
        print('Navigate to home');
        break;
    }
  }

  static void _handleLocalNotificationNavigation(String payload) {
    // Parse payload and handle navigation
    print('Handle local notification navigation: $payload');
  }

  // Public methods for sending notifications
  static Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'mycitykg_channel',
      'MyCityKg Notifications',
      channelDescription: 'Уведомления от приложения MyCityKg',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      notificationDetails,
      payload: payload,
    );
  }

  static Future<void> scheduleNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'mycitykg_channel',
      'MyCityKg Notifications',
      channelDescription: 'Уведомления от приложения MyCityKg',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.zonedSchedule(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      scheduledDate,
      notificationDetails,
      payload: payload,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  static Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }

  static Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }

  // Subscribe/unsubscribe from topics
  static Future<void> subscribeToTopic(String topic) async {
    await FirebaseService.subscribeToTopic(topic);
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    await FirebaseService.unsubscribeFromTopic(topic);
  }
}
