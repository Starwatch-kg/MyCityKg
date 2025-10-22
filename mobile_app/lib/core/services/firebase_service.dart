import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/foundation.dart';

import '../utils/logger.dart';
import 'notification_service.dart';

class FirebaseService {
  static FirebaseAuth get auth => FirebaseAuth.instance;
  static FirebaseFirestore get firestore => FirebaseFirestore.instance;
  static FirebaseStorage get storage => FirebaseStorage.instance;
  static FirebaseMessaging get messaging => FirebaseMessaging.instance;
  static FirebaseAnalytics get analytics => FirebaseAnalytics.instance;
  static FirebaseCrashlytics get crashlytics => FirebaseCrashlytics.instance;
  static FirebaseRemoteConfig get remoteConfig => FirebaseRemoteConfig.instance;

  static Future<void> initialize() async {
    try {
      // Initialize Firebase
      await Firebase.initializeApp();
      
      // Configure Crashlytics
      if (!kDebugMode) {
        FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
        PlatformDispatcher.instance.onError = (error, stack) {
          FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
          return true;
        };
      }
      
      // Configure Firestore settings
      firestore.settings = const Settings(
        persistenceEnabled: true,
        cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
      );
      
      // Configure Analytics
      await analytics.setAnalyticsCollectionEnabled(!kDebugMode);
      
      // Initialize Remote Config
      await _initializeRemoteConfig();
      
      // Initialize App Check (only in production)
      if (!kDebugMode) {
        await _initializeAppCheck();
      }
      
      // Initialize Firebase Messaging
      await _initializeMessaging();
      
      print('Firebase services initialized successfully');
    } catch (e) {
      print('Error initializing Firebase services: $e');
      rethrow;
    }
  }

  // Authentication Methods
  static Future<UserCredential?> signInWithEmailAndPassword(
    String email,
    String password,
  ) async {
    try {
      final credential = await auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      await analytics.logLogin(loginMethod: 'email');
      return credential;
    } on FirebaseAuthException catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<UserCredential?> createUserWithEmailAndPassword(
    String email,
    String password,
  ) async {
    try {
      final credential = await auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      await analytics.logSignUp(signUpMethod: 'email');
      return credential;
    } on FirebaseAuthException catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<void> signOut() async {
    try {
      await auth.signOut();
      await analytics.logEvent(name: 'logout');
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<void> sendPasswordResetEmail(String email) async {
    try {
      await auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  // Firestore Methods
  static Future<DocumentReference> addDocument(
    String collection,
    Map<String, dynamic> data,
  ) async {
    try {
      data['createdAt'] = FieldValue.serverTimestamp();
      data['updatedAt'] = FieldValue.serverTimestamp();
      
      return await firestore.collection(collection).add(data);
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<void> updateDocument(
    String collection,
    String documentId,
    Map<String, dynamic> data,
  ) async {
    try {
      data['updatedAt'] = FieldValue.serverTimestamp();
      
      await firestore.collection(collection).doc(documentId).update(data);
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<void> deleteDocument(
    String collection,
    String documentId,
  ) async {
    try {
      await firestore.collection(collection).doc(documentId).delete();
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Stream<QuerySnapshot> getCollectionStream(
    String collection, {
    Query Function(Query)? queryBuilder,
  }) {
    try {
      Query query = firestore.collection(collection);
      
      if (queryBuilder != null) {
        query = queryBuilder(query);
      }
      
      return query.snapshots();
    } catch (e) {
      crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<DocumentSnapshot> getDocument(
    String collection,
    String documentId,
  ) async {
    try {
      return await firestore.collection(collection).doc(documentId).get();
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  // Storage Methods
  static Future<String> uploadFile(
    String path,
    Uint8List data, {
    String? contentType,
  }) async {
    try {
      final ref = storage.ref().child(path);
      final metadata = SettableMetadata(contentType: contentType);
      
      final uploadTask = ref.putData(data, metadata);
      final snapshot = await uploadTask;
      
      return await snapshot.ref.getDownloadURL();
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  static Future<void> deleteFile(String path) async {
    try {
      await storage.ref().child(path).delete();
    } catch (e) {
      await crashlytics.recordError(e, null);
      rethrow;
    }
  }

  // Analytics Methods
  static Future<void> logEvent(
    String name, {
    Map<String, Object?>? parameters,
  }) async {
    try {
      await analytics.logEvent(name: name, parameters: parameters);
    } catch (e) {
      await crashlytics.recordError(e, null);
    }
  }

  static Future<void> setUserProperties(Map<String, String> properties) async {
    try {
      for (final entry in properties.entries) {
        await analytics.setUserProperty(
          name: entry.key,
          value: entry.value,
        );
      }
    } catch (e) {
      await crashlytics.recordError(e, null);
    }
  }

  // Messaging Methods
  static Future<String?> getMessagingToken() async {
    try {
      return await messaging.getToken();
    } catch (e) {
      await crashlytics.recordError(e, null);
      return null;
    }
  }

  static Future<void> subscribeToTopic(String topic) async {
    try {
      await messaging.subscribeToTopic(topic);
    } catch (e) {
      await crashlytics.recordError(e, null);
    }
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await messaging.unsubscribeFromTopic(topic);
    } catch (e) {
      await crashlytics.recordError(e, null);
    }
  }

  // Private initialization methods
  static Future<void> _initializeRemoteConfig() async {
    try {
      await remoteConfig.setConfigSettings(RemoteConfigSettings(
        fetchTimeout: const Duration(minutes: 1),
        minimumFetchInterval: const Duration(hours: 1),
      ));

      // Set default values
      await remoteConfig.setDefaults({
        'app_version': '1.0.0',
        'maintenance_mode': false,
        'api_base_url': 'https://api.mycitykg.com',
        'max_image_size': 5242880, // 5MB
        'enable_analytics': true,
        'enable_crashlytics': true,
      });

      // Fetch and activate
      await remoteConfig.fetchAndActivate();
      
      Logger.info('Remote Config initialized successfully');
    } catch (e) {
      Logger.error('Error initializing Remote Config: $e');
      await crashlytics.recordError(e, null);
    }
  }

  static Future<void> _initializeAppCheck() async {
    try {
      await FirebaseAppCheck.instance.activate(
        // Use debug provider in debug mode
        webProvider: ReCaptchaV3Provider('recaptcha-v3-site-key'),
        androidProvider: AndroidProvider.debug,
        appleProvider: AppleProvider.debug,
      );
      
      Logger.info('App Check initialized successfully');
    } catch (e) {
      Logger.error('Error initializing App Check: $e');
      await crashlytics.recordError(e, null);
    }
  }

  static Future<void> _initializeMessaging() async {
    try {
      // Request permission for notifications
      NotificationSettings settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        Logger.info('User granted permission for notifications');
        
        // Get FCM token
        String? token = await messaging.getToken();
        if (token != null) {
          Logger.info('FCM Token: $token');
          // TODO: Send token to server
        }

        // Handle foreground messages
        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          Logger.info('Got a message whilst in the foreground!');
          Logger.info('Message data: ${message.data}');

          if (message.notification != null) {
            Logger.info('Message also contained a notification: ${message.notification}');
            
            // Show local notification
            NotificationService.showNotification(
              title: message.notification!.title ?? 'MyCityKg',
              body: message.notification!.body ?? 'Новое уведомление',
              payload: message.data.toString(),
            );
          }
        });

        // Handle notification taps
        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
          Logger.info('A new onMessageOpenedApp event was published!');
          // TODO: Navigate to specific screen based on message data
        });

      } else {
        Logger.warning('User declined or has not accepted permission for notifications');
      }
    } catch (e) {
      Logger.error('Error initializing Firebase Messaging: $e');
      await crashlytics.recordError(e, null);
    }
  }

  // Remote Config helper methods
  static String getRemoteConfigString(String key, {String defaultValue = ''}) {
    try {
      return remoteConfig.getString(key);
    } catch (e) {
      Logger.error('Error getting remote config string for key $key: $e');
      return defaultValue;
    }
  }

  static bool getRemoteConfigBool(String key, {bool defaultValue = false}) {
    try {
      return remoteConfig.getBool(key);
    } catch (e) {
      Logger.error('Error getting remote config bool for key $key: $e');
      return defaultValue;
    }
  }

  static int getRemoteConfigInt(String key, {int defaultValue = 0}) {
    try {
      return remoteConfig.getInt(key);
    } catch (e) {
      Logger.error('Error getting remote config int for key $key: $e');
      return defaultValue;
    }
  }

  static double getRemoteConfigDouble(String key, {double defaultValue = 0.0}) {
    try {
      return remoteConfig.getDouble(key);
    } catch (e) {
      Logger.error('Error getting remote config double for key $key: $e');
      return defaultValue;
    }
  }
}
