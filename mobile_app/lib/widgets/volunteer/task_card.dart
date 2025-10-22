import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';

class TaskCard extends StatelessWidget {
  final Map<String, dynamic> task;
  final VoidCallback? onTap;
  final VoidCallback? onRegister;
  final VoidCallback? onCancel;
  final VoidCallback? onComplete;
  final bool showRegisterButton;

  const TaskCard({
    super.key,
    required this.task,
    this.onTap,
    this.onRegister,
    this.onCancel,
    this.onComplete,
    this.showRegisterButton = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with status and type
              Row(
                children: [
                  _buildStatusChip(task['status']),
                  const SizedBox(width: 8),
                  _buildTypeChip(task['taskType']),
                  const Spacer(),
                  if (task['rewards']?['points'] != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.warning.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.star_outline,
                            size: 12,
                            color: AppColors.warning,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${task['rewards']['points']} баллов',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Title
              Text(
                task['title'] ?? 'Без названия',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 8),
              
              // Description
              Text(
                task['description'] ?? 'Нет описания',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 12),
              
              // Task details
              _buildTaskDetails(),
              
              const SizedBox(height: 12),
              
              // Location and organizer
              Row(
                children: [
                  if (task['address'] != null) ...[
                    Icon(
                      Icons.location_on_outlined,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        task['address'],
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
              
              const SizedBox(height: 8),
              
              // Organizer
              if (task['organizer'] != null)
                Row(
                  children: [
                    Icon(
                      Icons.person_outline,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Организатор: ${_getOrganizerName(task['organizer'])}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              
              const SizedBox(height: 12),
              
              // Volunteers info
              _buildVolunteersInfo(),
              
              const SizedBox(height: 12),
              
              // Actions
              _buildActions(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String? status) {
    final color = AppColors.getVolunteerStatusColor(status ?? 'active');
    final text = _getStatusText(status);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  Widget _buildTypeChip(String? taskType) {
    final color = AppColors.primary;
    final text = _getTaskTypeText(taskType);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  Widget _buildTaskDetails() {
    return Row(
      children: [
        // Date and time
        Icon(
          Icons.schedule_outlined,
          size: 16,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          _formatDateTime(task['scheduledDate']),
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        
        const SizedBox(width: 16),
        
        // Duration
        if (task['estimatedDuration'] != null) ...[
          Icon(
            Icons.timer_outlined,
            size: 16,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 4),
          Text(
            '${task['estimatedDuration']} ч',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildVolunteersInfo() {
    final maxVolunteers = task['maxVolunteers'] ?? 10;
    final registeredCount = _getRegisteredVolunteersCount();
    final availableSpots = maxVolunteers - registeredCount;
    
    return Row(
      children: [
        Icon(
          Icons.group_outlined,
          size: 16,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          '$registeredCount/$maxVolunteers волонтеров',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Progress bar
        Expanded(
          child: LinearProgressIndicator(
            value: registeredCount / maxVolunteers,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation<Color>(
              availableSpots > 0 ? AppColors.success : AppColors.warning,
            ),
            minHeight: 4,
          ),
        ),
        
        const SizedBox(width: 8),
        
        Text(
          availableSpots > 0 ? '$availableSpots мест' : 'Заполнено',
          style: TextStyle(
            fontSize: 12,
            color: availableSpots > 0 ? AppColors.success : AppColors.warning,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Row(
      children: [
        // Requirements indicator
        if (task['requirements']?['skills']?.isNotEmpty == true ||
            task['requirements']?['equipment']?.isNotEmpty == true)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.info.withOpacity(0.3),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.info_outline,
                  size: 12,
                  color: AppColors.info,
                ),
                const SizedBox(width: 4),
                Text(
                  'Требования',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppColors.info,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        
        const Spacer(),
        
        // Action buttons
        if (showRegisterButton && onRegister != null)
          ElevatedButton(
            onPressed: _canRegister() ? onRegister : null,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Записаться',
              style: TextStyle(fontSize: 12),
            ),
          ),
        
        if (onCancel != null)
          OutlinedButton(
            onPressed: onCancel,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Отменить',
              style: TextStyle(fontSize: 12),
            ),
          ),
        
        if (onComplete != null)
          ElevatedButton(
            onPressed: onComplete,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.success,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Завершить',
              style: TextStyle(fontSize: 12, color: Colors.white),
            ),
          ),
      ],
    );
  }

  bool _canRegister() {
    final maxVolunteers = task['maxVolunteers'] ?? 10;
    final registeredCount = _getRegisteredVolunteersCount();
    final scheduledDate = DateTime.tryParse(task['scheduledDate'] ?? '');
    
    return registeredCount < maxVolunteers &&
           task['status'] == 'active' &&
           (scheduledDate?.isAfter(DateTime.now()) ?? false);
  }

  int _getRegisteredVolunteersCount() {
    final volunteers = task['volunteers'] as List<dynamic>? ?? [];
    return volunteers.where((v) => v['status'] != 'cancelled').length;
  }

  String _getOrganizerName(Map<String, dynamic> organizer) {
    final firstName = organizer['firstName'] ?? '';
    final lastName = organizer['lastName'] ?? '';
    return '$firstName $lastName'.trim();
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'active':
        return 'Активная';
      case 'pending':
        return 'В процессе';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return 'Активная';
    }
  }

  String _getTaskTypeText(String? taskType) {
    switch (taskType) {
      case 'cleaning':
        return 'Уборка';
      case 'repair':
        return 'Ремонт';
      case 'painting':
        return 'Покраска';
      case 'planting':
        return 'Посадка';
      case 'monitoring':
        return 'Мониторинг';
      case 'education':
        return 'Образование';
      case 'other':
        return 'Другое';
      default:
        return 'Другое';
    }
  }

  String _formatDateTime(dynamic dateTime) {
    if (dateTime == null) return 'Не указано';
    
    try {
      DateTime dt;
      if (dateTime is String) {
        dt = DateTime.parse(dateTime);
      } else if (dateTime is DateTime) {
        dt = dateTime;
      } else {
        return 'Не указано';
      }
      
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final taskDate = DateTime(dt.year, dt.month, dt.day);
      
      String dateStr;
      if (taskDate == today) {
        dateStr = 'Сегодня';
      } else if (taskDate == today.add(const Duration(days: 1))) {
        dateStr = 'Завтра';
      } else {
        dateStr = DateFormat('dd.MM.yyyy').format(dt);
      }
      
      final timeStr = DateFormat('HH:mm').format(dt);
      return '$dateStr в $timeStr';
    } catch (e) {
      return 'Не указано';
    }
  }
}
