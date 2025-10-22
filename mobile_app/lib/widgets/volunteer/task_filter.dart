import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/app_constants.dart';

class TaskFilter extends StatelessWidget {
  final String? selectedTaskType;
  final String selectedStatus;
  final Function(String?) onTaskTypeSelected;
  final Function(String) onStatusSelected;

  const TaskFilter({
    super.key,
    this.selectedTaskType,
    required this.selectedStatus,
    required this.onTaskTypeSelected,
    required this.onStatusSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status filter
          Text(
            'Статус',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          _buildStatusFilter(),
          
          const SizedBox(height: 16),
          
          // Task type filter
          Text(
            'Тип задачи',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          _buildTaskTypeFilter(),
        ],
      ),
    );
  }

  Widget _buildStatusFilter() {
    final statuses = [
      {'value': 'active', 'label': 'Активные', 'icon': Icons.play_circle_outline},
      {'value': 'pending', 'label': 'В процессе', 'icon': Icons.pending_outlined},
      {'value': 'completed', 'label': 'Завершенные', 'icon': Icons.check_circle_outline},
      {'value': 'cancelled', 'label': 'Отмененные', 'icon': Icons.cancel_outlined},
    ];

    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: statuses.map((status) {
          final isSelected = selectedStatus == status['value'];
          final color = _getStatusColor(status['value'] as String);
          
          return Container(
            margin: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    status['icon'] as IconData,
                    size: 16,
                    color: isSelected ? Colors.white : color,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    status['label'] as String,
                    style: TextStyle(
                      color: isSelected ? Colors.white : color,
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  onStatusSelected(status['value'] as String);
                }
              },
              backgroundColor: Colors.white,
              selectedColor: color,
              checkmarkColor: Colors.white,
              side: BorderSide(
                color: isSelected ? color : color.withOpacity(0.3),
                width: 1,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTaskTypeFilter() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        // All tasks option
        _buildTaskTypeChip(
          label: 'Все типы',
          value: null,
          icon: Icons.all_inclusive,
        ),
        
        // Specific task types
        ...AppConstants.volunteerTaskTypes.map((taskType) {
          return _buildTaskTypeChip(
            label: _getTaskTypeLabel(taskType),
            value: taskType,
            icon: _getTaskTypeIcon(taskType),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildTaskTypeChip({
    required String label,
    required String? value,
    required IconData icon,
  }) {
    final isSelected = selectedTaskType == value;
    final color = AppColors.primary;
    
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: isSelected ? Colors.white : color,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : color,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ],
      ),
      selected: isSelected,
      onSelected: (selected) {
        onTaskTypeSelected(selected ? value : null);
      },
      backgroundColor: Colors.white,
      selectedColor: color,
      checkmarkColor: Colors.white,
      side: BorderSide(
        color: isSelected ? color : color.withOpacity(0.3),
        width: 1,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.compact,
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'completed':
        return AppColors.info;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.primary;
    }
  }

  String _getTaskTypeLabel(String taskType) {
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
        return 'Неизвестно';
    }
  }

  IconData _getTaskTypeIcon(String taskType) {
    switch (taskType) {
      case 'cleaning':
        return Icons.cleaning_services_outlined;
      case 'repair':
        return Icons.build_outlined;
      case 'painting':
        return Icons.brush_outlined;
      case 'planting':
        return Icons.eco_outlined;
      case 'monitoring':
        return Icons.visibility_outlined;
      case 'education':
        return Icons.school_outlined;
      case 'other':
        return Icons.more_horiz_outlined;
      default:
        return Icons.help_outline;
    }
  }
}
