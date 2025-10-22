import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class VolunteerStats extends StatelessWidget {
  final Map<String, dynamic> stats;

  const VolunteerStats({
    super.key,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Main stats grid
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.5,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            _buildStatCard(
              title: 'Задач выполнено',
              value: '${stats['tasksCompleted'] ?? 0}',
              icon: Icons.task_alt_outlined,
              color: AppColors.success,
            ),
            _buildStatCard(
              title: 'Часов отработано',
              value: '${(stats['hoursWorked'] ?? 0.0).toStringAsFixed(1)}',
              icon: Icons.access_time_outlined,
              color: AppColors.info,
            ),
            _buildStatCard(
              title: 'Рейтинг',
              value: '${(stats['rating'] ?? 0.0).toStringAsFixed(1)}',
              icon: Icons.star_outline,
              color: AppColors.warning,
              suffix: '/5.0',
            ),
            _buildStatCard(
              title: 'Жалоб подано',
              value: '${stats['reportsSubmitted'] ?? 0}',
              icon: Icons.report_outlined,
              color: AppColors.primary,
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Additional stats
        _buildProgressStats(),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    String? suffix,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 32,
            color: color,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              if (suffix != null)
                Text(
                  suffix,
                  style: TextStyle(
                    fontSize: 14,
                    color: color.withOpacity(0.7),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressStats() {
    final tasksCompleted = stats['tasksCompleted'] ?? 0;
    final hoursWorked = (stats['hoursWorked'] ?? 0.0).toDouble();
    final rating = (stats['rating'] ?? 0.0).toDouble();
    final reportsResolved = stats['reportsResolved'] ?? 0;
    final reportsSubmitted = stats['reportsSubmitted'] ?? 0;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Прогресс',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        
        // Tasks progress
        _buildProgressItem(
          title: 'Выполнено задач',
          current: tasksCompleted,
          target: _getNextTaskTarget(tasksCompleted),
          color: AppColors.success,
          unit: 'задач',
        ),
        
        const SizedBox(height: 12),
        
        // Hours progress
        _buildProgressItem(
          title: 'Отработано часов',
          current: hoursWorked.toInt(),
          target: _getNextHoursTarget(hoursWorked.toInt()),
          color: AppColors.info,
          unit: 'часов',
        ),
        
        const SizedBox(height: 12),
        
        // Rating progress
        _buildProgressItem(
          title: 'Рейтинг',
          current: (rating * 20).toInt(), // Convert to percentage
          target: 100,
          color: AppColors.warning,
          unit: '%',
          showAsPercentage: true,
        ),
        
        if (reportsSubmitted > 0) ...[
          const SizedBox(height: 12),
          
          // Reports resolution rate
          _buildProgressItem(
            title: 'Решено жалоб',
            current: reportsResolved,
            target: reportsSubmitted,
            color: AppColors.primary,
            unit: 'из $reportsSubmitted',
          ),
        ],
      ],
    );
  }

  Widget _buildProgressItem({
    required String title,
    required int current,
    required int target,
    required Color color,
    required String unit,
    bool showAsPercentage = false,
  }) {
    final progress = target > 0 ? (current / target).clamp(0.0, 1.0) : 0.0;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              showAsPercentage 
                  ? '$current%'
                  : '$current $unit',
              style: TextStyle(
                fontSize: 14,
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: color.withOpacity(0.2),
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 6,
        ),
        const SizedBox(height: 4),
        Text(
          showAsPercentage
              ? 'До максимума: ${100 - current}%'
              : 'До следующего уровня: ${target - current} $unit',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  int _getNextTaskTarget(int current) {
    if (current < 5) return 5;
    if (current < 10) return 10;
    if (current < 25) return 25;
    if (current < 50) return 50;
    if (current < 100) return 100;
    return ((current / 50).ceil() + 1) * 50;
  }

  int _getNextHoursTarget(int current) {
    if (current < 10) return 10;
    if (current < 25) return 25;
    if (current < 50) return 50;
    if (current < 100) return 100;
    if (current < 200) return 200;
    return ((current / 100).ceil() + 1) * 100;
  }
}
