import 'dart:io';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../utils/app_constants.dart';
import '../models/user_model.dart';
import '../models/report_model.dart';

// API service provider
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

class ApiService {
  late final Dio _dio;
  String? _authToken;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.connectTimeout,
      receiveTimeout: AppConstants.receiveTimeout,
      sendTimeout: AppConstants.sendTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token if available
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          // Handle token expiration
          if (error.response?.statusCode == 401) {
            // Token expired, clear it
            _authToken = null;
          }
          handler.next(error);
        },
      ),
    );

    // Add logging interceptor in debug mode
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print(obj),
    ));
  }

  void setAuthToken(String token) {
    _authToken = token;
  }

  void clearAuthToken() {
    _authToken = null;
  }

  // Auth endpoints
  Future<Map<String, dynamic>> signIn(String email, String password, String? fcmToken) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
        if (fcmToken != null) 'fcmToken': fcmToken,
      });

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        setAuthToken(token);
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка входа');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
    String? fcmToken,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        if (phone != null) 'phone': phone,
        if (fcmToken != null) 'fcmToken': fcmToken,
      });

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        setAuthToken(token);
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка регистрации');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> signOut(String? fcmToken) async {
    try {
      await _dio.post('/auth/logout', data: {
        if (fcmToken != null) 'fcmToken': fcmToken,
      });
    } on DioException catch (e) {
      // Ignore errors during sign out
    } finally {
      clearAuthToken();
    }
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        setAuthToken(token);
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка обновления токена');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      final response = await _dio.post('/auth/forgot-password', data: {
        'email': email,
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка сброса пароля');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> resetPassword(String token, String password) async {
    try {
      final response = await _dio.post('/auth/reset-password', data: {
        'token': token,
        'password': password,
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка сброса пароля');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> verifyEmail(String token) async {
    try {
      final response = await _dio.post('/auth/verify-email', data: {
        'token': token,
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка подтверждения email');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка получения пользователя');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // User endpoints
  Future<UserModel> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? avatar,
    Map<String, dynamic>? preferences,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (phone != null) data['phone'] = phone;
      if (avatar != null) data['avatar'] = avatar;
      if (preferences != null) data['preferences'] = preferences;

      final response = await _dio.put('/users/profile', data: data);

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка обновления профиля');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<UserModel> updateLocation(double latitude, double longitude, String? address) async {
    try {
      final response = await _dio.put('/users/location', data: {
        'latitude': latitude,
        'longitude': longitude,
        if (address != null) 'address': address,
      });

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка обновления местоположения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final response = await _dio.put('/users/password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка изменения пароля');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> deleteAccount() async {
    try {
      final response = await _dio.delete('/users/account');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка удаления аккаунта');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> addFCMToken(String token) async {
    try {
      await _dio.post('/users/fcm-token', data: {
        'token': token,
      });
    } on DioException catch (e) {
      // Ignore FCM token errors
    }
  }

  Future<void> removeFCMToken(String token) async {
    try {
      await _dio.delete('/users/fcm-token', data: {
        'token': token,
      });
    } on DioException catch (e) {
      // Ignore FCM token errors
    }
  }

  // Report endpoints
  Future<List<ReportModel>> getReports({
    String? category,
    String? status,
    double? latitude,
    double? longitude,
    double? radius,
    int? limit,
    int? offset,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) queryParams['category'] = category;
      if (status != null) queryParams['status'] = status;
      if (latitude != null) queryParams['latitude'] = latitude;
      if (longitude != null) queryParams['longitude'] = longitude;
      if (radius != null) queryParams['radius'] = radius;
      if (limit != null) queryParams['limit'] = limit;
      if (offset != null) queryParams['offset'] = offset;

      final response = await _dio.get('/reports', queryParameters: queryParams);

      if (response.data['success'] == true) {
        final List<dynamic> reportsData = response.data['data']['reports'];
        return reportsData.map((json) => ReportModel.fromJson(json)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки сообщений');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ReportModel> getReport(String id) async {
    try {
      final response = await _dio.get('/reports/$id');

      if (response.data['success'] == true) {
        return ReportModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки сообщения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ReportModel> createReport(CreateReportRequest request, List<XFile>? images) async {
    try {
      FormData formData = FormData.fromMap({
        'title': request.title,
        'description': request.description,
        'category': request.category,
        'priority': request.priority,
        'location': jsonEncode(request.location.toJson()),
        if (request.address != null) 'address': request.address,
        'isAnonymous': request.isAnonymous,
        'tags': jsonEncode(request.tags),
      });

      // Add images if provided
      if (images != null && images.isNotEmpty) {
        for (int i = 0; i < images.length; i++) {
          final file = File(images[i].path);
          formData.files.add(MapEntry(
            'images',
            await MultipartFile.fromFile(
              file.path,
              filename: 'image_$i.jpg',
            ),
          ));
        }
      }

      final response = await _dio.post('/reports', data: formData);

      if (response.data['success'] == true) {
        return ReportModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка создания сообщения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ReportModel> updateReport(String id, UpdateReportRequest request) async {
    try {
      final response = await _dio.put('/reports/$id', data: request.toJson());

      if (response.data['success'] == true) {
        return ReportModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка обновления сообщения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> deleteReport(String id) async {
    try {
      final response = await _dio.delete('/reports/$id');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка удаления сообщения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> voteReport(String id, bool isUpvote) async {
    try {
      final response = await _dio.post('/reports/$id/vote', data: {
        'vote': isUpvote ? 'up' : 'down',
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка голосования');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> removeVote(String id) async {
    try {
      final response = await _dio.delete('/reports/$id/vote');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка удаления голоса');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Volunteer endpoints
  Future<List<Map<String, dynamic>>> getVolunteerTasks({
    String? taskType,
    String? status,
    double? latitude,
    double? longitude,
    double? radius,
    int? limit,
    int? offset,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (taskType != null) queryParams['taskType'] = taskType;
      if (status != null) queryParams['status'] = status;
      if (latitude != null) queryParams['latitude'] = latitude;
      if (longitude != null) queryParams['longitude'] = longitude;
      if (radius != null) queryParams['radius'] = radius;
      if (limit != null) queryParams['limit'] = limit;
      if (offset != null) queryParams['offset'] = offset;

      final response = await _dio.get('/tasks', queryParameters: queryParams);

      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data']['tasks']);
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки задач');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> getVolunteerTask(String id) async {
    try {
      final response = await _dio.get('/tasks/$id');

      if (response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки задачи');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> registerForTask(String taskId) async {
    try {
      final response = await _dio.post('/tasks/$taskId/register');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка регистрации на задачу');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> cancelTaskRegistration(String taskId) async {
    try {
      final response = await _dio.delete('/tasks/$taskId/register');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка отмены регистрации');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> completeTask(String taskId, double hoursWorked, int rating, String? feedback) async {
    try {
      final response = await _dio.post('/tasks/$taskId/complete', data: {
        'hoursWorked': hoursWorked,
        'rating': rating,
        if (feedback != null) 'feedback': feedback,
      });

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Ошибка завершения задачи');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> getVolunteerStats() async {
    try {
      final response = await _dio.get('/volunteers/stats');

      if (response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки статистики');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Upload endpoints
  Future<String> uploadImage(XFile image) async {
    try {
      final file = File(image.path);
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          file.path,
          filename: image.name,
        ),
      });

      final response = await _dio.post('/upload/image', data: formData);

      if (response.data['success'] == true) {
        return response.data['data']['url'];
      } else {
        throw Exception(response.data['message'] ?? 'Ошибка загрузки изображения');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Error handling
  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Превышено время ожидания. Проверьте подключение к интернету.');
      
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'];
        
        switch (statusCode) {
          case 400:
            return Exception(message ?? 'Неверный запрос');
          case 401:
            return Exception('Не авторизован');
          case 403:
            return Exception('Доступ запрещен');
          case 404:
            return Exception('Ресурс не найден');
          case 422:
            return Exception(message ?? 'Ошибка валидации данных');
          case 429:
            return Exception('Слишком много запросов. Попробуйте позже.');
          case 500:
            return Exception('Внутренняя ошибка сервера');
          default:
            return Exception(message ?? 'Ошибка сервера ($statusCode)');
        }
      
      case DioExceptionType.cancel:
        return Exception('Запрос отменен');
      
      case DioExceptionType.unknown:
        if (e.error is SocketException) {
          return Exception('Нет подключения к интернету');
        }
        return Exception('Неизвестная ошибка: ${e.message}');
      
      default:
        return Exception('Ошибка сети: ${e.message}');
    }
  }
}
