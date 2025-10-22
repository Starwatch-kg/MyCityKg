import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF2E7D32);
  static const Color primaryLight = Color(0xFF60AD5E);
  static const Color primaryDark = Color(0xFF005005);
  
  // Secondary Colors
  static const Color secondary = Color(0xFF1976D2);
  static const Color secondaryLight = Color(0xFF63A4FF);
  static const Color secondaryDark = Color(0xFF004BA0);
  
  // Accent Colors
  static const Color accent = Color(0xFFFF9800);
  static const Color accentLight = Color(0xFFFFC947);
  static const Color accentDark = Color(0xFFC66900);
  
  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);
  
  // Neutral Colors
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF0F0F0);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textDisabled = Color(0xFFBDBDBD);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  
  // Border Colors
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderLight = Color(0xFFF0F0F0);
  static const Color borderDark = Color(0xFFBDBDBD);
  
  // Volunteer Status Colors
  static const Color volunteerActive = Color(0xFF4CAF50);
  static const Color volunteerPending = Color(0xFFFF9800);
  static const Color volunteerCompleted = Color(0xFF2196F3);
  static const Color volunteerCancelled = Color(0xFFF44336);
  
  // Report Status Colors
  static const Color reportNew = Color(0xFF9C27B0);
  static const Color reportInProgress = Color(0xFF2196F3);
  static const Color reportResolved = Color(0xFF4CAF50);
  static const Color reportRejected = Color(0xFFF44336);
  
  // Category Colors
  static const Color categoryRoad = Color(0xFF795548);
  static const Color categoryLighting = Color(0xFFFFEB3B);
  static const Color categoryWaste = Color(0xFF607D8B);
  static const Color categoryPark = Color(0xFF4CAF50);
  static const Color categoryBuilding = Color(0xFF9E9E9E);
  static const Color categoryOther = Color(0xFF673AB7);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accent, accentDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);
  
  // Overlay Colors
  static const Color overlayLight = Color(0x0A000000);
  static const Color overlayMedium = Color(0x1F000000);
  static const Color overlayDark = Color(0x33000000);
  
  // Helper methods
  static Color getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'road':
      case 'дорога':
        return categoryRoad;
      case 'lighting':
      case 'освещение':
        return categoryLighting;
      case 'waste':
      case 'мусор':
        return categoryWaste;
      case 'park':
      case 'парк':
        return categoryPark;
      case 'building':
      case 'здание':
        return categoryBuilding;
      default:
        return categoryOther;
    }
  }
  
  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'new':
      case 'новая':
        return reportNew;
      case 'in_progress':
      case 'в_работе':
        return reportInProgress;
      case 'resolved':
      case 'решена':
        return reportResolved;
      case 'rejected':
      case 'отклонена':
        return reportRejected;
      default:
        return textSecondary;
    }
  }
  
  static Color getVolunteerStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'активный':
        return volunteerActive;
      case 'pending':
      case 'ожидание':
        return volunteerPending;
      case 'completed':
      case 'завершен':
        return volunteerCompleted;
      case 'cancelled':
      case 'отменен':
        return volunteerCancelled;
      default:
        return textSecondary;
    }
  }
}
