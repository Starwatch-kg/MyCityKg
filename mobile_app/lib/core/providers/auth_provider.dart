import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../services/api_service.dart';
import '../services/firebase_service.dart';
import '../utils/app_constants.dart';
import '../models/user_model.dart';

// Auth state provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  return AuthNotifier(ref);
});

// Auth loading provider
final authLoadingProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.isLoading;
});

// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.value != null;
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final Ref _ref;
  late final ApiService _apiService;
  late final FirebaseService _firebaseService;
  late final Box _settingsBox;

  AuthNotifier(this._ref) : super(const AsyncValue.loading()) {
    _apiService = _ref.read(apiServiceProvider);
    _firebaseService = _ref.read(firebaseServiceProvider);
    _settingsBox = Hive.box(AppConstants.settingsBox);
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    try {
      // Check if user is already logged in
      final token = _settingsBox.get('auth_token');
      if (token != null) {
        // Verify token and get user info
        final user = await _apiService.getCurrentUser();
        state = AsyncValue.data(user);
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      // Token might be expired, clear it
      await _clearAuthData();
      state = const AsyncValue.data(null);
    }
  }

  Future<UserModel> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    
    try {
      // Get FCM token
      final fcmToken = await _firebaseService.getMessagingToken();
      
      // Sign in with API
      final response = await _apiService.signIn(email, password, fcmToken);
      
      // Save auth data
      await _saveAuthData(response['token'], response['refreshToken']);
      
      // Create user model
      final user = UserModel.fromJson(response['user']);
      
      state = AsyncValue.data(user);
      return user;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      rethrow;
    }
  }

  Future<UserModel> signUp({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      // Get FCM token
      final fcmToken = await _firebaseService.getMessagingToken();
      
      // Sign up with API
      final response = await _apiService.signUp(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        fcmToken: fcmToken,
      );
      
      // Save auth data
      await _saveAuthData(response['token'], response['refreshToken']);
      
      // Create user model
      final user = UserModel.fromJson(response['user']);
      
      state = AsyncValue.data(user);
      return user;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      // Get FCM token to remove from server
      final fcmToken = await _firebaseService.getMessagingToken();
      
      // Sign out from API
      await _apiService.signOut(fcmToken);
    } catch (e) {
      // Ignore API errors during sign out
    } finally {
      // Clear local auth data
      await _clearAuthData();
      state = const AsyncValue.data(null);
    }
  }

  Future<void> refreshToken() async {
    try {
      final refreshToken = _settingsBox.get('refresh_token');
      if (refreshToken == null) {
        throw Exception('No refresh token available');
      }

      final response = await _apiService.refreshToken(refreshToken);
      
      // Save new tokens
      await _saveAuthData(response['token'], response['refreshToken']);
    } catch (e) {
      // Refresh failed, sign out user
      await signOut();
      rethrow;
    }
  }

  Future<void> forgotPassword(String email) async {
    await _apiService.forgotPassword(email);
  }

  Future<void> resetPassword(String token, String password) async {
    await _apiService.resetPassword(token, password);
  }

  Future<void> verifyEmail(String token) async {
    await _apiService.verifyEmail(token);
    
    // Refresh user data
    if (state.value != null) {
      final user = await _apiService.getCurrentUser();
      state = AsyncValue.data(user);
    }
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? avatar,
    Map<String, dynamic>? preferences,
  }) async {
    if (state.value == null) return;

    try {
      final updatedUser = await _apiService.updateProfile(
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        avatar: avatar,
        preferences: preferences,
      );
      
      state = AsyncValue.data(updatedUser);
    } catch (e) {
      // Don't change state on error, just rethrow
      rethrow;
    }
  }

  Future<void> updateLocation(double latitude, double longitude, String? address) async {
    if (state.value == null) return;

    try {
      final updatedUser = await _apiService.updateLocation(latitude, longitude, address);
      state = AsyncValue.data(updatedUser);
    } catch (e) {
      // Don't change state on error, just rethrow
      rethrow;
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _apiService.changePassword(currentPassword, newPassword);
  }

  Future<void> deleteAccount() async {
    if (state.value == null) return;

    await _apiService.deleteAccount();
    await _clearAuthData();
    state = const AsyncValue.data(null);
  }

  Future<void> addFCMToken(String token) async {
    if (state.value == null) return;

    try {
      await _apiService.addFCMToken(token);
    } catch (e) {
      // Ignore FCM token errors
    }
  }

  Future<void> removeFCMToken(String token) async {
    if (state.value == null) return;

    try {
      await _apiService.removeFCMToken(token);
    } catch (e) {
      // Ignore FCM token errors
    }
  }

  Future<void> _saveAuthData(String token, String refreshToken) async {
    await _settingsBox.put('auth_token', token);
    await _settingsBox.put('refresh_token', refreshToken);
  }

  Future<void> _clearAuthData() async {
    await _settingsBox.delete('auth_token');
    await _settingsBox.delete('refresh_token');
  }

  String? get authToken => _settingsBox.get('auth_token');
  String? get refreshToken => _settingsBox.get('refresh_token');
}

// Convenience providers
final currentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.value;
});

final userRoleProvider = Provider<String?>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.role;
});

final isVolunteerProvider = Provider<bool>((ref) {
  final role = ref.watch(userRoleProvider);
  return ['volunteer', 'moderator', 'admin'].contains(role);
});

final isModeratorProvider = Provider<bool>((ref) {
  final role = ref.watch(userRoleProvider);
  return ['moderator', 'admin'].contains(role);
});

final isAdminProvider = Provider<bool>((ref) {
  final role = ref.watch(userRoleProvider);
  return role == 'admin';
});
