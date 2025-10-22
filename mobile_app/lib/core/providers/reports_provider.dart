import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../services/api_service.dart';
import '../models/report_model.dart';

// Reports state provider
final reportsProvider = StateNotifierProvider<ReportsNotifier, AsyncValue<List<ReportModel>>>((ref) {
  return ReportsNotifier(ref);
});

// Filtered reports provider
final filteredReportsProvider = Provider<AsyncValue<List<ReportModel>>>((ref) {
  final reports = ref.watch(reportsProvider);
  final filter = ref.watch(reportFilterProvider);
  
  return reports.when(
    data: (reportsList) {
      var filtered = reportsList;
      
      // Filter by category
      if (filter.category != null) {
        filtered = filtered.where((report) => report.category == filter.category).toList();
      }
      
      // Filter by status
      if (filter.status != null) {
        filtered = filtered.where((report) => report.status == filter.status).toList();
      }
      
      // Filter by priority
      if (filter.priority != null) {
        filtered = filtered.where((report) => report.priority == filter.priority).toList();
      }
      
      // Filter by location (if provided)
      if (filter.latitude != null && filter.longitude != null && filter.radius != null) {
        // TODO: Implement distance calculation
        // filtered = filtered.where((report) => 
        //   calculateDistance(report.location.latitude, report.location.longitude, 
        //                   filter.latitude!, filter.longitude!) <= filter.radius!
        // ).toList();
      }
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      return AsyncValue.data(filtered);
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

// Report filter provider
final reportFilterProvider = StateNotifierProvider<ReportFilterNotifier, ReportFilter>((ref) {
  return ReportFilterNotifier();
});

// My reports provider
final myReportsProvider = Provider<AsyncValue<List<ReportModel>>>((ref) {
  final reports = ref.watch(reportsProvider);
  final authState = ref.watch(authStateProvider);
  final userId = authState.value?.id;
  
  if (userId == null) {
    return const AsyncValue.data([]);
  }
  
  return reports.when(
    data: (reportsList) {
      final myReports = reportsList.where((report) => report.userId == userId).toList();
      myReports.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return AsyncValue.data(myReports);
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

class ReportsNotifier extends StateNotifier<AsyncValue<List<ReportModel>>> {
  final Ref _ref;
  late final ApiService _apiService;

  ReportsNotifier(this._ref) : super(const AsyncValue.loading()) {
    _apiService = _ref.read(apiServiceProvider);
  }

  Future<void> loadReports({
    String? category,
    String? status,
    double? latitude,
    double? longitude,
    double? radius,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final reports = await _apiService.getReports(
        category: category,
        status: status,
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        limit: 100,
      );
      
      state = AsyncValue.data(reports);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refreshReports() async {
    final filter = _ref.read(reportFilterProvider);
    await loadReports(
      category: filter.category,
      status: filter.status,
      latitude: filter.latitude,
      longitude: filter.longitude,
      radius: filter.radius,
    );
  }

  Future<ReportModel> createReport(Map<String, dynamic> reportData) async {
    try {
      final images = reportData['images'] as List<XFile>?;
      
      final request = CreateReportRequest(
        title: reportData['title'],
        description: reportData['description'],
        category: reportData['category'],
        priority: reportData['priority'],
        location: LocationData(
          type: reportData['location']['type'],
          coordinates: List<double>.from(reportData['location']['coordinates']),
        ),
        address: reportData['address'],
        isAnonymous: reportData['isAnonymous'],
        tags: List<String>.from(reportData['tags'] ?? []),
      );

      final newReport = await _apiService.createReport(request, images);
      
      // Add to current state
      state.whenData((reports) {
        state = AsyncValue.data([newReport, ...reports]);
      });
      
      return newReport;
    } catch (e) {
      rethrow;
    }
  }

  Future<ReportModel> updateReport(String id, UpdateReportRequest request) async {
    try {
      final updatedReport = await _apiService.updateReport(id, request);
      
      // Update in current state
      state.whenData((reports) {
        final updatedReports = reports.map((report) {
          return report.id == id ? updatedReport : report;
        }).toList();
        state = AsyncValue.data(updatedReports);
      });
      
      return updatedReport;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteReport(String id) async {
    try {
      await _apiService.deleteReport(id);
      
      // Remove from current state
      state.whenData((reports) {
        final updatedReports = reports.where((report) => report.id != id).toList();
        state = AsyncValue.data(updatedReports);
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<void> voteReport(String id, bool isUpvote) async {
    try {
      await _apiService.voteReport(id, isUpvote);
      
      // Refresh the specific report or all reports
      await refreshReports();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> removeVote(String id) async {
    try {
      await _apiService.removeVote(id);
      
      // Refresh the specific report or all reports
      await refreshReports();
    } catch (e) {
      rethrow;
    }
  }

  void filterByCategory(String? category) {
    _ref.read(reportFilterProvider.notifier).setCategory(category);
    final filter = _ref.read(reportFilterProvider);
    loadReports(
      category: filter.category,
      status: filter.status,
      latitude: filter.latitude,
      longitude: filter.longitude,
      radius: filter.radius,
    );
  }

  void filterByStatus(String? status) {
    _ref.read(reportFilterProvider.notifier).setStatus(status);
    final filter = _ref.read(reportFilterProvider);
    loadReports(
      category: filter.category,
      status: filter.status,
      latitude: filter.latitude,
      longitude: filter.longitude,
      radius: filter.radius,
    );
  }

  void filterByLocation(double? latitude, double? longitude, double? radius) {
    _ref.read(reportFilterProvider.notifier).setLocation(latitude, longitude, radius);
    final filter = _ref.read(reportFilterProvider);
    loadReports(
      category: filter.category,
      status: filter.status,
      latitude: filter.latitude,
      longitude: filter.longitude,
      radius: filter.radius,
    );
  }

  void clearFilters() {
    _ref.read(reportFilterProvider.notifier).clear();
    loadReports();
  }
}

class ReportFilterNotifier extends StateNotifier<ReportFilter> {
  ReportFilterNotifier() : super(const ReportFilter());

  void setCategory(String? category) {
    state = state.copyWith(category: category);
  }

  void setStatus(String? status) {
    state = state.copyWith(status: status);
  }

  void setPriority(String? priority) {
    state = state.copyWith(priority: priority);
  }

  void setLocation(double? latitude, double? longitude, double? radius) {
    state = state.copyWith(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
    );
  }

  void clear() {
    state = const ReportFilter();
  }
}

class ReportFilter {
  final String? category;
  final String? status;
  final String? priority;
  final double? latitude;
  final double? longitude;
  final double? radius;

  const ReportFilter({
    this.category,
    this.status,
    this.priority,
    this.latitude,
    this.longitude,
    this.radius,
  });

  ReportFilter copyWith({
    String? category,
    String? status,
    String? priority,
    double? latitude,
    double? longitude,
    double? radius,
  }) {
    return ReportFilter(
      category: category ?? this.category,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      radius: radius ?? this.radius,
    );
  }
}

// Import auth provider
import '../providers/auth_provider.dart';
