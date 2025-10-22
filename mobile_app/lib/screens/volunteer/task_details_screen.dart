import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../widgets/common/custom_app_bar.dart';

class TaskDetailsScreen extends ConsumerWidget {
  final String taskId;
  final Map<String, dynamic>? task;

  const TaskDetailsScreen({
    super.key,
    required this.taskId,
    this.task,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Детали задачи',
        showBackButton: true,
      ),
      body: task != null
          ? _buildTaskDetails(context, task!)
          : const Center(
              child: CircularProgressIndicator(),
            ),
    );
  }

  Widget _buildTaskDetails(BuildContext context, Map<String, dynamic> task) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            task['title'] ?? 'Без названия',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            task['description'] ?? 'Нет описания',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement task registration
            },
            child: const Text('Записаться на задачу'),
          ),
        ],
      ),
    );
  }
}
