import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../core/theme/app_colors.dart';

class ReportCard extends StatelessWidget {
  final Map<String, dynamic> report;
  final VoidCallback? onTap;
  final Function(bool)? onVote;
  final bool showVoting;
  final bool showDistance;
  final double? distance;

  const ReportCard({
    super.key,
    required this.report,
    this.onTap,
    this.onVote,
    this.showVoting = true,
    this.showDistance = false,
    this.distance,
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
              // Header with status and category
              Row(
                children: [
                  _buildStatusChip(report['status']),
                  const SizedBox(width: 8),
                  _buildCategoryChip(report['category']),
                  const Spacer(),
                  if (showDistance && distance != null)
                    Text(
                      _formatDistance(distance!),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Title
              Text(
                report['title'] ?? 'Без названия',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 8),
              
              // Description
              Text(
                report['description'] ?? 'Нет описания',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 12),
              
              // Images preview
              if (report['images'] != null && (report['images'] as List).isNotEmpty)
                _buildImagesPreview(report['images']),
              
              const SizedBox(height: 12),
              
              // Footer with metadata
              Row(
                children: [
                  // Location
                  if (report['address'] != null) ...[
                    Icon(
                      Icons.location_on_outlined,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        report['address'],
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                  
                  const SizedBox(width: 16),
                  
                  // Time
                  Text(
                    _formatTime(report['createdAt']),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Actions
              Row(
                children: [
                  // View count
                  Row(
                    children: [
                      Icon(
                        Icons.visibility_outlined,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${report['viewCount'] ?? 0}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Voting
                  if (showVoting && onVote != null) ...[
                    _buildVoteButton(
                      icon: Icons.thumb_up_outlined,
                      count: report['votes']?['up'] ?? 0,
                      color: AppColors.success,
                      onPressed: () => onVote!(true),
                    ),
                    
                    const SizedBox(width: 8),
                    
                    _buildVoteButton(
                      icon: Icons.thumb_down_outlined,
                      count: report['votes']?['down'] ?? 0,
                      color: AppColors.error,
                      onPressed: () => onVote!(false),
                    ),
                  ],
                  
                  const Spacer(),
                  
                  // Priority indicator
                  if (report['priority'] == 'high' || report['priority'] == 'critical')
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: report['priority'] == 'critical' 
                            ? AppColors.error.withOpacity(0.1)
                            : AppColors.warning.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: report['priority'] == 'critical' 
                              ? AppColors.error.withOpacity(0.3)
                              : AppColors.warning.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.priority_high,
                            size: 12,
                            color: report['priority'] == 'critical' 
                                ? AppColors.error
                                : AppColors.warning,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            report['priority'] == 'critical' ? 'Критично' : 'Важно',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: report['priority'] == 'critical' 
                                  ? AppColors.error
                                  : AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String? status) {
    final color = AppColors.getStatusColor(status ?? 'new');
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

  Widget _buildCategoryChip(String? category) {
    final color = AppColors.getCategoryColor(category ?? 'other');
    final text = _getCategoryText(category);
    
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

  Widget _buildImagesPreview(List<dynamic> images) {
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: images.length > 3 ? 3 : images.length,
        itemBuilder: (context, index) {
          final image = images[index];
          final isLast = index == 2 && images.length > 3;
          
          return Container(
            margin: const EdgeInsets.only(right: 8),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    image['url'] ?? '',
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.image_not_supported_outlined,
                          color: AppColors.textSecondary,
                        ),
                      );
                    },
                  ),
                ),
                
                if (isLast)
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '+${images.length - 3}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildVoteButton({
    required IconData icon,
    required int count,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: color,
            ),
            const SizedBox(width: 4),
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 12,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'new':
        return 'Новая';
      case 'in_progress':
        return 'В работе';
      case 'resolved':
        return 'Решена';
      case 'rejected':
        return 'Отклонена';
      default:
        return 'Новая';
    }
  }

  String _getCategoryText(String? category) {
    switch (category) {
      case 'road':
        return 'Дороги';
      case 'lighting':
        return 'Освещение';
      case 'waste':
        return 'Мусор';
      case 'park':
        return 'Парки';
      case 'building':
        return 'Здания';
      case 'water':
        return 'Водоснабжение';
      case 'transport':
        return 'Транспорт';
      case 'other':
        return 'Другое';
      default:
        return 'Другое';
    }
  }

  String _formatTime(dynamic createdAt) {
    if (createdAt == null) return 'Неизвестно';
    
    try {
      DateTime dateTime;
      if (createdAt is String) {
        dateTime = DateTime.parse(createdAt);
      } else if (createdAt is DateTime) {
        dateTime = createdAt;
      } else {
        return 'Неизвестно';
      }
      
      // Configure timeago for Russian
      timeago.setLocaleMessages('ru', timeago.RuMessages());
      return timeago.format(dateTime, locale: 'ru');
    } catch (e) {
      return 'Неизвестно';
    }
  }

  String _formatDistance(double distance) {
    if (distance < 1000) {
      return '${distance.round()} м';
    } else {
      return '${(distance / 1000).toStringAsFixed(1)} км';
    }
  }
}
