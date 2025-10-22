import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/api_service.dart';
import 'auth_provider.dart';

// Volunteer state provider
final volunteerProvider = StateNotifierProvider<VolunteerNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return VolunteerNotifier(ref);
});

// Available tasks provider
final availableTasksProvider = Provider<AsyncValue<List<Map<String, dynamic>>>>((ref) {
  final volunteerState = ref.watch(volunteerProvider);
  return volunteerState.when(
    data: (data) => AsyncValue.data(data['availableTasks'] as List<Map<String, dynamic>>? ?? []),
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

// My tasks provider
final myTasksProvider = Provider<AsyncValue<List<Map<String, dynamic>>>>((ref) {
  final volunteerState = ref.watch(volunteerProvider);
  return volunteerState.when(
    data: (data) => AsyncValue.data(data['myTasks'] as List<Map<String, dynamic>>? ?? []),
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

// User stats provider
final userStatsProvider = Provider<AsyncValue<Map<String, dynamic>>>((ref) {
  final volunteerState = ref.watch(volunteerProvider);
  return volunteerState.when(
    data: (data) => AsyncValue.data(data['userStats'] as Map<String, dynamic>? ?? {}),
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

class VolunteerNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final Ref _ref;
  late final ApiService _apiService;

  VolunteerNotifier(this._ref) : super(const AsyncValue.loading()) {
    _apiService = _ref.read(apiServiceProvider);
    state = AsyncValue.data({
      'availableTasks': <Map<String, dynamic>>[],
      'myTasks': <Map<String, dynamic>>[],
      'userStats': <String, dynamic>{},
      'activityHistory': <Map<String, dynamic>>[],
    });
  }

  Future<void> loadTasks({
    String? taskType,
    String? status,
    double? latitude,
    double? longitude,
    double? radius,
  }) async {
    try {
      final tasks = await _apiService.getVolunteerTasks(
        taskType: taskType,
        status: status ?? 'active',
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        limit: 50,
      );

      state.whenData((currentData) {
        state = AsyncValue.data({
          ...currentData,
          'availableTasks': tasks,
        });
      });
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> loadMyTasks() async {
    final authState = _ref.read(authStateProvider);
    final userId = authState.value?.id;
    
    if (userId == null) {
      state.whenData((currentData) {
        state = AsyncValue.data({
          ...currentData,
          'myTasks': <Map<String, dynamic>>[],
        });
      });
      return;
    }

    try {
      // Get all tasks and filter by user participation
      final allTasks = await _apiService.getVolunteerTasks(limit: 100);
      
      // Filter tasks where user is registered
      final myTasks = allTasks.where((task) {
        final volunteers = task['volunteers'] as List<dynamic>? ?? [];
        return volunteers.any((volunteer) => volunteer['user'] == userId);
      }).toList();

      state.whenData((currentData) {
        state = AsyncValue.data({
          ...currentData,
          'myTasks': myTasks,
        });
      });
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> loadUserStats() async {
    try {
      final stats = await _apiService.getVolunteerStats();
      
      // Generate mock activity history
      final activityHistory = _generateMockActivityHistory(stats);

      state.whenData((currentData) {
        state = AsyncValue.data({
          ...currentData,
          'userStats': stats,
          'activityHistory': activityHistory,
        });
      });
    } catch (e, stack) {
      // Use default stats if API fails
      state.whenData((currentData) {
        state = AsyncValue.data({
          ...currentData,
          'userStats': {
            'tasksCompleted': 0,
            'hoursWorked': 0.0,
            'rating': 0.0,
            'reportsSubmitted': 0,
            'reportsResolved': 0,
          },
          'activityHistory': <Map<String, dynamic>>[],
        });
      });
    }
  }

  Future<void> registerForTask(String taskId) async {
    try {
      await _apiService.registerForTask(taskId);
      
      // Refresh tasks
      await loadTasks();
      await loadMyTasks();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> cancelRegistration(String taskId) async {
    try {
      await _apiService.cancelTaskRegistration(taskId);
      
      // Refresh tasks
      await loadTasks();
      await loadMyTasks();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> completeTask(String taskId, double hoursWorked, int rating, String? feedback) async {
    try {
      await _apiService.completeTask(taskId, hoursWorked, rating, feedback);
      
      // Refresh tasks and stats
      await loadTasks();
      await loadMyTasks();
      await loadUserStats();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> filterTasks({String? taskType, String? status}) async {
    await loadTasks(taskType: taskType, status: status);
  }

  Future<void> refreshAll() async {
    await Future.wait([
      loadTasks(),
      loadMyTasks(),
      loadUserStats(),
    ]);
  }

  List<Map<String, dynamic>> _generateMockActivityHistory(Map<String, dynamic> stats) {
    final activities = <Map<String, dynamic>>[];
    final tasksCompleted = stats['tasksCompleted'] as int? ?? 0;
    
    // Generate some mock activities based on stats
    for (int i = 0; i < tasksCompleted && i < 10; i++) {
      final daysAgo = i * 7 + (i * 2); // Spread activities over time
      final date = DateTime.now().subtract(Duration(days: daysAgo));
      
      activities.add({
        'type': 'task_completed',
        'title': 'Завершена волонтерская задача',
        'description': _getRandomTaskDescription(),
        'date': _formatDate(date),
        'points': 10 + (i * 5),
      });
    }
    
    return activities;
  }

  String _getRandomTaskDescription() {
    final descriptions = [
      'Уборка парка',
      'Покраска скамеек',
      'Посадка деревьев',
      'Ремонт детской площадки',
      'Очистка водоема',
      'Благоустройство двора',
      'Помощь пожилым людям',
      'Экологическая акция',
    ];
    
    return descriptions[DateTime.now().millisecond % descriptions.length];
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) {
      return 'Сегодня';
    } else if (difference == 1) {
      return 'Вчера';
    } else if (difference < 7) {
      return '$difference дней назад';
    } else if (difference < 30) {
      final weeks = (difference / 7).floor();
      return '$weeks ${weeks == 1 ? 'неделю' : 'недель'} назад';
    } else {
      final months = (difference / 30).floor();
      return '$months ${months == 1 ? 'месяц' : 'месяцев'} назад';
    }
  }
}

// Task filter provider
final taskFilterProvider = StateNotifierProvider<TaskFilterNotifier, TaskFilter>((ref) {
  return TaskFilterNotifier();
});

class TaskFilterNotifier extends StateNotifier<TaskFilter> {
  TaskFilterNotifier() : super(const TaskFilter());

  void setTaskType(String? taskType) {
    state = state.copyWith(taskType: taskType);
  }

  void setStatus(String? status) {
    state = state.copyWith(status: status);
  }

  void setLocation(double? latitude, double? longitude, double? radius) {
    state = state.copyWith(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
    );
  }

  void clear() {
    state = const TaskFilter();
  }
}

class TaskFilter {
  final String? taskType;
  final String? status;
  final double? latitude;
  final double? longitude;
  final double? radius;

  const TaskFilter({
    this.taskType,
    this.status,
    this.latitude,
    this.longitude,
    this.radius,
  });

  TaskFilter copyWith({
    String? taskType,
    String? status,
    double? latitude,
    double? longitude,
    double? radius,
  }) {
    return TaskFilter(
      taskType: taskType ?? this.taskType,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      radius: radius ?? this.radius,
    );
  }
}
