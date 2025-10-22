import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/app_constants.dart';

class CategoryFilter extends StatelessWidget {
  final String? selectedCategory;
  final Function(String?) onCategorySelected;
  final bool showAllOption;

  const CategoryFilter({
    super.key,
    this.selectedCategory,
    required this.onCategorySelected,
    this.showAllOption = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          if (showAllOption)
            _buildFilterChip(
              context,
              label: 'Все',
              value: null,
              icon: Icons.all_inclusive,
            ),
          
          ...AppConstants.reportCategories.map((category) {
            return _buildFilterChip(
              context,
              label: _getCategoryLabel(category),
              value: category,
              icon: _getCategoryIcon(category),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    BuildContext context, {
    required String label,
    required String? value,
    required IconData icon,
  }) {
    final isSelected = selectedCategory == value;
    final color = value != null ? AppColors.getCategoryColor(value) : AppColors.primary;
    
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: FilterChip(
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
          onCategorySelected(selected ? value : null);
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
  }

  String _getCategoryLabel(String category) {
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
        return 'Неизвестно';
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'road':
        return Icons.route_outlined;
      case 'lighting':
        return Icons.lightbulb_outline;
      case 'waste':
        return Icons.delete_outline;
      case 'park':
        return Icons.park_outlined;
      case 'building':
        return Icons.apartment_outlined;
      case 'water':
        return Icons.water_drop_outlined;
      case 'transport':
        return Icons.directions_bus_outlined;
      case 'other':
        return Icons.more_horiz_outlined;
      default:
        return Icons.help_outline;
    }
  }
}
