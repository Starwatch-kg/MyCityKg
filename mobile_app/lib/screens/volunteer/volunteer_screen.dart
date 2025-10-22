import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/volunteer_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/common/custom_app_bar.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/volunteer/task_card.dart';
import '../../widgets/volunteer/volunteer_stats.dart';
import '../../widgets/volunteer/task_filter.dart';
import '../volunteer/create_task_screen.dart';
import '../volunteer/task_details_screen.dart';

class VolunteerScreen extends ConsumerStatefulWidget {
  const VolunteerScreen({super.key});

  @override
  ConsumerState<VolunteerScreen> createState() => _VolunteerScreenState();
}

class _VolunteerScreenState extends ConsumerState<VolunteerScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _selectedTaskType;
  String _selectedStatus = 'active';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    
    // Load volunteer tasks
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(volunteerProvider.notifier).loadTasks();
      ref.read(volunteerProvider.notifier).loadUserStats();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final volunteerState = ref.watch(volunteerProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Волонтерство',
        actions: [
          if (user?.role == 'volunteer' || user?.role == 'moderator' || user?.role == 'admin')
            IconButton(
              icon: const Icon(Icons.add_outlined),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const CreateTaskScreen(),
                  ),
                );
              },
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(
              icon: Icon(Icons.list_outlined),
              text: 'Доступные',
            ),
            Tab(
              icon: Icon(Icons.person_outlined),
              text: 'Мои задачи',
            ),
            Tab(
              icon: Icon(Icons.bar_chart_outlined),
              text: 'Статистика',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Task filter (only for available tasks tab)
          if (_tabController.index == 0) ...[
            TaskFilter(
              selectedTaskType: _selectedTaskType,
              selectedStatus: _selectedStatus,
              onTaskTypeSelected: (taskType) {
                setState(() {
                  _selectedTaskType = taskType;
                });
                ref.read(volunteerProvider.notifier).filterTasks(
                  taskType: taskType,
                  status: _selectedStatus,
                );
              },
              onStatusSelected: (status) {
                setState(() {
                  _selectedStatus = status;
                });
                ref.read(volunteerProvider.notifier).filterTasks(
                  taskType: _selectedTaskType,
                  status: status,
                );
              },
            ),
          ],
          
          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Available tasks
                _buildAvailableTasksTab(volunteerState),
                
                // My tasks
                _buildMyTasksTab(volunteerState, user?.id),
                
                // Statistics
                _buildStatisticsTab(volunteerState),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableTasksTab(AsyncValue<Map<String, dynamic>> volunteerState) {
    return volunteerState.when(
      data: (data) {
        final tasks = data['availableTasks'] as List<dynamic>? ?? [];
        
        if (tasks.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.volunteer_activism_outlined,
                  size: 64,
                  color: AppColors.textSecondary,
                ),
                SizedBox(height: 16),
                Text(
                  'Нет доступных задач',
                  style: TextStyle(
                    fontSize: 18,
                    color: AppColors.textSecondary,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Новые волонтерские задачи появятся здесь',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            await ref.read(volunteerProvider.notifier).loadTasks();
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TaskCard(
                  task: task,
                  onTap: () => _navigateToTaskDetails(task),
                  onRegister: () => _registerForTask(task['id']),
                  showRegisterButton: true,
                ),
              );
            },
          ),
        );
      },
      loading: () => const LoadingWidget(message: 'Загрузка задач...'),
      error: (error, stack) => _buildErrorWidget(error, () {
        ref.read(volunteerProvider.notifier).loadTasks();
      }),
    );
  }

  Widget _buildMyTasksTab(AsyncValue<Map<String, dynamic>> volunteerState, String? userId) {
    if (userId == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.login_outlined,
              size: 64,
              color: AppColors.textSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'Войдите в аккаунт',
              style: TextStyle(
                fontSize: 18,
                color: AppColors.textSecondary,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Для просмотра ваших задач необходимо войти в систему',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return volunteerState.when(
      data: (data) {
        final myTasks = data['myTasks'] as List<dynamic>? ?? [];
        
        if (myTasks.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.assignment_outlined,
                  size: 64,
                  color: AppColors.textSecondary,
                ),
                SizedBox(height: 16),
                Text(
                  'У вас нет задач',
                  style: TextStyle(
                    fontSize: 18,
                    color: AppColors.textSecondary,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Зарегистрируйтесь на доступные задачи, чтобы начать помогать городу',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            await ref.read(volunteerProvider.notifier).loadMyTasks();
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: myTasks.length,
            itemBuilder: (context, index) {
              final task = myTasks[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TaskCard(
                  task: task,
                  onTap: () => _navigateToTaskDetails(task),
                  onCancel: task['status'] == 'registered' 
                      ? () => _cancelRegistration(task['id'])
                      : null,
                  onComplete: task['status'] == 'confirmed'
                      ? () => _completeTask(task['id'])
                      : null,
                  showRegisterButton: false,
                ),
              );
            },
          ),
        );
      },
      loading: () => const LoadingWidget(message: 'Загрузка ваших задач...'),
      error: (error, stack) => _buildErrorWidget(error, () {
        ref.read(volunteerProvider.notifier).loadMyTasks();
      }),
    );
  }

  Widget _buildStatisticsTab(AsyncValue<Map<String, dynamic>> volunteerState) {
    return volunteerState.when(
      data: (data) {
        final stats = data['userStats'] as Map<String, dynamic>? ?? {};
        
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ваша статистика',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              VolunteerStats(stats: stats),
              
              const SizedBox(height: 24),
              
              Text(
                'Достижения',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              _buildAchievements(stats),
              
              const SizedBox(height: 24),
              
              Text(
                'История активности',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              _buildActivityHistory(data['activityHistory'] as List<dynamic>? ?? []),
            ],
          ),
        );
      },
      loading: () => const LoadingWidget(message: 'Загрузка статистики...'),
      error: (error, stack) => _buildErrorWidget(error, () {
        ref.read(volunteerProvider.notifier).loadUserStats();
      }),
    );
  }

  Widget _buildAchievements(Map<String, dynamic> stats) {
    final tasksCompleted = stats['tasksCompleted'] ?? 0;
    final hoursWorked = stats['hoursWorked'] ?? 0;
    final rating = stats['rating'] ?? 0.0;

    final achievements = <Map<String, dynamic>>[];

    // Task completion achievements
    if (tasksCompleted >= 1) {
      achievements.add({
        'title': 'Первый шаг',
        'description': 'Выполнили первую задачу',
        'icon': Icons.star_outlined,
        'color': AppColors.warning,
        'unlocked': true,
      });
    }
    
    if (tasksCompleted >= 5) {
      achievements.add({
        'title': 'Активный помощник',
        'description': 'Выполнили 5 задач',
        'icon': Icons.star_half_outlined,
        'color': AppColors.warning,
        'unlocked': true,
      });
    }
    
    if (tasksCompleted >= 10) {
      achievements.add({
        'title': 'Супер волонтер',
        'description': 'Выполнили 10 задач',
        'icon': Icons.star,
        'color': AppColors.warning,
        'unlocked': true,
      });
    }

    // Hours worked achievements
    if (hoursWorked >= 10) {
      achievements.add({
        'title': 'Трудолюбивый',
        'description': 'Отработали 10 часов',
        'icon': Icons.access_time,
        'color': AppColors.info,
        'unlocked': true,
      });
    }

    // Rating achievements
    if (rating >= 4.0) {
      achievements.add({
        'title': 'Высокий рейтинг',
        'description': 'Рейтинг выше 4.0',
        'icon': Icons.thumb_up,
        'color': AppColors.success,
        'unlocked': true,
      });
    }

    if (achievements.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.emoji_events_outlined,
              color: AppColors.textSecondary,
            ),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Выполните первую задачу, чтобы получить достижение',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: achievements.map((achievement) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: achievement['unlocked'] 
                ? achievement['color'].withOpacity(0.1)
                : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: achievement['unlocked']
                  ? achievement['color'].withOpacity(0.3)
                  : AppColors.border,
            ),
          ),
          child: Row(
            children: [
              Icon(
                achievement['icon'],
                color: achievement['unlocked']
                    ? achievement['color']
                    : AppColors.textSecondary,
                size: 32,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      achievement['title'],
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: achievement['unlocked']
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      achievement['description'],
                      style: TextStyle(
                        color: achievement['unlocked']
                            ? AppColors.textSecondary
                            : AppColors.textDisabled,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActivityHistory(List<dynamic> history) {
    if (history.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.history_outlined,
              color: AppColors.textSecondary,
            ),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'История активности пуста',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: history.take(5).map<Widget>((activity) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(
                _getActivityIcon(activity['type']),
                color: AppColors.primary,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity['title'] ?? 'Активность',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    Text(
                      activity['date'] ?? '',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  IconData _getActivityIcon(String? type) {
    switch (type) {
      case 'task_completed':
        return Icons.check_circle_outline;
      case 'task_registered':
        return Icons.person_add_outlined;
      case 'task_cancelled':
        return Icons.cancel_outlined;
      default:
        return Icons.info_outline;
    }
  }

  Widget _buildErrorWidget(Object error, VoidCallback onRetry) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Ошибка загрузки',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Попробовать снова'),
          ),
        ],
      ),
    );
  }

  void _navigateToTaskDetails(Map<String, dynamic> task) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TaskDetailsScreen(task: task),
      ),
    );
  }

  Future<void> _registerForTask(String taskId) async {
    try {
      await ref.read(volunteerProvider.notifier).registerForTask(taskId);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Вы успешно зарегистрированы на задачу'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка регистрации: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _cancelRegistration(String taskId) async {
    try {
      await ref.read(volunteerProvider.notifier).cancelRegistration(taskId);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Регистрация отменена'),
            backgroundColor: AppColors.info,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка отмены: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _completeTask(String taskId) async {
    // Show completion dialog
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => _buildCompletionDialog(),
    );

    if (result != null) {
      try {
        await ref.read(volunteerProvider.notifier).completeTask(
          taskId,
          result['hoursWorked'],
          result['rating'],
          result['feedback'],
        );
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Задача отмечена как выполненная'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Ошибка завершения: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  Widget _buildCompletionDialog() {
    final hoursController = TextEditingController();
    final feedbackController = TextEditingController();
    double rating = 5.0;

    return StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Завершение задачи'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: hoursController,
              decoration: const InputDecoration(
                labelText: 'Отработано часов',
                hintText: '2.5',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            
            Text('Оценка: ${rating.toInt()}'),
            Slider(
              value: rating,
              min: 1,
              max: 5,
              divisions: 4,
              onChanged: (value) {
                setState(() {
                  rating = value;
                });
              },
            ),
            const SizedBox(height: 16),
            
            TextField(
              controller: feedbackController,
              decoration: const InputDecoration(
                labelText: 'Отзыв (необязательно)',
                hintText: 'Поделитесь впечатлениями о задаче',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () {
              final hoursWorked = double.tryParse(hoursController.text) ?? 0;
              if (hoursWorked > 0) {
                Navigator.of(context).pop({
                  'hoursWorked': hoursWorked,
                  'rating': rating.toInt(),
                  'feedback': feedbackController.text.trim(),
                });
              }
            },
            child: const Text('Завершить'),
          ),
        ],
      ),
    );
  }
}
