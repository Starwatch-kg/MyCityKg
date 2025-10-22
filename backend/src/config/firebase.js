const admin = require('firebase-admin');
const config = require('./config');
const logger = require('../utils/logger');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = async () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      logger.info('Firebase already initialized');
      return firebaseApp;
    }

    // Validate Firebase configuration
    if (!config.firebase.projectId || !config.firebase.privateKey || !config.firebase.clientEmail) {
      logger.warn('Firebase configuration incomplete, skipping initialization');
      return null;
    }

    // Initialize Firebase Admin SDK
    const serviceAccount = {
      type: 'service_account',
      project_id: config.firebase.projectId,
      private_key_id: config.firebase.privateKeyId,
      private_key: config.firebase.privateKey,
      client_email: config.firebase.clientEmail,
      client_id: config.firebase.clientId,
      auth_uri: config.firebase.authUri,
      token_uri: config.firebase.tokenUri,
      auth_provider_x509_cert_url: config.firebase.authProviderX509CertUrl,
      client_x509_cert_url: config.firebase.clientX509CertUrl,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.firebase.projectId,
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

/**
 * Get Firebase Auth instance
 */
const getAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return admin.auth();
};

/**
 * Get Firestore instance
 */
const getFirestore = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return admin.firestore();
};

/**
 * Get Firebase Messaging instance
 */
const getMessaging = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return admin.messaging();
};

/**
 * Send push notification to a single device
 * @param {string} token - FCM token
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 */
const sendNotificationToDevice = async (token, notification, data = {}) => {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized, cannot send notification');
      return null;
    }

    const messaging = getMessaging();
    
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2E7D32',
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    logger.info(`Notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send push notification to multiple devices
 * @param {Array} tokens - Array of FCM tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 */
const sendNotificationToDevices = async (tokens, notification, data = {}) => {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized, cannot send notifications');
      return null;
    }

    if (!tokens || tokens.length === 0) {
      logger.warn('No tokens provided for notification');
      return null;
    }

    const messaging = getMessaging();
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2E7D32',
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      tokens,
    };

    const response = await messaging.sendMulticast(message);
    
    logger.info(`Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
    
    // Log failed tokens
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          logger.warn(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
        }
      });
    }
    
    return response;
  } catch (error) {
    logger.error('Error sending notifications:', error);
    throw error;
  }
};

/**
 * Send notification to topic
 * @param {string} topic - Topic name
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 */
const sendNotificationToTopic = async (topic, notification, data = {}) => {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized, cannot send notification');
      return null;
    }

    const messaging = getMessaging();
    
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2E7D32',
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    logger.info(`Notification sent to topic ${topic}: ${response}`);
    return response;
  } catch (error) {
    logger.error(`Error sending notification to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Subscribe tokens to topic
 * @param {Array} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 */
const subscribeToTopic = async (tokens, topic) => {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized, cannot subscribe to topic');
      return null;
    }

    const messaging = getMessaging();
    const response = await messaging.subscribeToTopic(tokens, topic);
    
    logger.info(`Subscribed to topic ${topic}: ${response.successCount} successful, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    logger.error(`Error subscribing to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Unsubscribe tokens from topic
 * @param {Array} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized, cannot unsubscribe from topic');
      return null;
    }

    const messaging = getMessaging();
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    
    logger.info(`Unsubscribed from topic ${topic}: ${response.successCount} successful, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    logger.error(`Error unsubscribing from topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 */
const verifyIdToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying ID token:', error);
    throw error;
  }
};

/**
 * Create custom token
 * @param {string} uid - User ID
 * @param {Object} additionalClaims - Additional claims
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const auth = getAuth();
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    logger.error('Error creating custom token:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  getMessaging,
  sendNotificationToDevice,
  sendNotificationToDevices,
  sendNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  verifyIdToken,
  createCustomToken,
};
