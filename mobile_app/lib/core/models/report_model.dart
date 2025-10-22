import 'package:json_annotation/json_annotation.dart';

part 'report_model.g.dart';

@JsonSerializable()
class ReportModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String priority;
  final String status;
  final LocationData location;
  final String? address;
  final List<ImageData> images;
  final String userId;
  final bool isAnonymous;
  final String? assignedTo;
  final DateTime? estimatedResolutionDate;
  final DateTime? actualResolutionDate;
  final String? resolutionNotes;
  final VoteData votes;
  final int viewCount;
  final List<String> tags;
  final ReportMetadata metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  ReportModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    required this.location,
    this.address,
    required this.images,
    required this.userId,
    required this.isAnonymous,
    this.assignedTo,
    this.estimatedResolutionDate,
    this.actualResolutionDate,
    this.resolutionNotes,
    required this.votes,
    required this.viewCount,
    required this.tags,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReportModel.fromJson(Map<String, dynamic> json) => _$ReportModelFromJson(json);
  Map<String, dynamic> toJson() => _$ReportModelToJson(this);

  int get totalVotes => votes.up - votes.down;
  
  double get votePercentage {
    final total = votes.up + votes.down;
    return total > 0 ? (votes.up / total) * 100 : 0;
  }

  int get daysSinceCreation {
    return DateTime.now().difference(createdAt).inDays;
  }

  int? get resolutionTimeInDays {
    if (actualResolutionDate != null) {
      return actualResolutionDate!.difference(createdAt).inDays;
    }
    return null;
  }

  bool get isResolved => status == 'resolved';
  bool get isInProgress => status == 'in_progress';
  bool get isNew => status == 'new';
  bool get isRejected => status == 'rejected';

  bool get isHighPriority => priority == 'high' || priority == 'critical';
  bool get isCritical => priority == 'critical';

  ReportModel copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    String? priority,
    String? status,
    LocationData? location,
    String? address,
    List<ImageData>? images,
    String? userId,
    bool? isAnonymous,
    String? assignedTo,
    DateTime? estimatedResolutionDate,
    DateTime? actualResolutionDate,
    String? resolutionNotes,
    VoteData? votes,
    int? viewCount,
    List<String>? tags,
    ReportMetadata? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ReportModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      location: location ?? this.location,
      address: address ?? this.address,
      images: images ?? this.images,
      userId: userId ?? this.userId,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      assignedTo: assignedTo ?? this.assignedTo,
      estimatedResolutionDate: estimatedResolutionDate ?? this.estimatedResolutionDate,
      actualResolutionDate: actualResolutionDate ?? this.actualResolutionDate,
      resolutionNotes: resolutionNotes ?? this.resolutionNotes,
      votes: votes ?? this.votes,
      viewCount: viewCount ?? this.viewCount,
      tags: tags ?? this.tags,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@JsonSerializable()
class LocationData {
  final String type;
  final List<double> coordinates;

  LocationData({
    required this.type,
    required this.coordinates,
  });

  factory LocationData.fromJson(Map<String, dynamic> json) => _$LocationDataFromJson(json);
  Map<String, dynamic> toJson() => _$LocationDataToJson(this);

  double get longitude => coordinates.isNotEmpty ? coordinates[0] : 0.0;
  double get latitude => coordinates.length > 1 ? coordinates[1] : 0.0;
}

@JsonSerializable()
class ImageData {
  final String url;
  final String publicId;
  final String? caption;
  final DateTime uploadedAt;

  ImageData({
    required this.url,
    required this.publicId,
    this.caption,
    required this.uploadedAt,
  });

  factory ImageData.fromJson(Map<String, dynamic> json) => _$ImageDataFromJson(json);
  Map<String, dynamic> toJson() => _$ImageDataToJson(this);
}

@JsonSerializable()
class VoteData {
  final int up;
  final int down;
  final List<UserVote> users;

  VoteData({
    required this.up,
    required this.down,
    required this.users,
  });

  factory VoteData.fromJson(Map<String, dynamic> json) => _$VoteDataFromJson(json);
  Map<String, dynamic> toJson() => _$VoteDataToJson(this);

  String? getUserVote(String userId) {
    final userVote = users.firstWhere(
      (vote) => vote.userId == userId,
      orElse: () => UserVote(userId: '', vote: '', votedAt: DateTime.now()),
    );
    return userVote.userId.isNotEmpty ? userVote.vote : null;
  }
}

@JsonSerializable()
class UserVote {
  final String userId;
  final String vote; // 'up' or 'down'
  final DateTime votedAt;

  UserVote({
    required this.userId,
    required this.vote,
    required this.votedAt,
  });

  factory UserVote.fromJson(Map<String, dynamic> json) => _$UserVoteFromJson(json);
  Map<String, dynamic> toJson() => _$UserVoteToJson(this);
}

@JsonSerializable()
class ReportMetadata {
  final String? deviceInfo;
  final String? appVersion;
  final String submissionMethod;
  final String? ipAddress;
  final String? userAgent;

  ReportMetadata({
    this.deviceInfo,
    this.appVersion,
    required this.submissionMethod,
    this.ipAddress,
    this.userAgent,
  });

  factory ReportMetadata.fromJson(Map<String, dynamic> json) => _$ReportMetadataFromJson(json);
  Map<String, dynamic> toJson() => _$ReportMetadataToJson(this);
}

// Report statistics model
@JsonSerializable()
class ReportStatistics {
  final int total;
  final int newReports;
  final int inProgress;
  final int resolved;
  final int rejected;
  final double averageResolutionTime;
  final Map<String, int> categoryBreakdown;
  final Map<String, int> priorityBreakdown;

  ReportStatistics({
    required this.total,
    required this.newReports,
    required this.inProgress,
    required this.resolved,
    required this.rejected,
    required this.averageResolutionTime,
    required this.categoryBreakdown,
    required this.priorityBreakdown,
  });

  factory ReportStatistics.fromJson(Map<String, dynamic> json) => _$ReportStatisticsFromJson(json);
  Map<String, dynamic> toJson() => _$ReportStatisticsToJson(this);

  double get resolutionRate {
    return total > 0 ? (resolved / total) * 100 : 0;
  }

  String get mostCommonCategory {
    if (categoryBreakdown.isEmpty) return 'N/A';
    
    final sortedEntries = categoryBreakdown.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    return sortedEntries.first.key;
  }

  String get mostCommonPriority {
    if (priorityBreakdown.isEmpty) return 'N/A';
    
    final sortedEntries = priorityBreakdown.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    return sortedEntries.first.key;
  }
}

// Create report request model
@JsonSerializable()
class CreateReportRequest {
  final String title;
  final String description;
  final String category;
  final String priority;
  final LocationData location;
  final String? address;
  final bool isAnonymous;
  final List<String> tags;

  CreateReportRequest({
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.location,
    this.address,
    required this.isAnonymous,
    required this.tags,
  });

  factory CreateReportRequest.fromJson(Map<String, dynamic> json) => _$CreateReportRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateReportRequestToJson(this);
}

// Update report request model
@JsonSerializable()
class UpdateReportRequest {
  final String? title;
  final String? description;
  final String? category;
  final String? priority;
  final String? status;
  final String? assignedTo;
  final DateTime? estimatedResolutionDate;
  final DateTime? actualResolutionDate;
  final String? resolutionNotes;
  final List<String>? tags;

  UpdateReportRequest({
    this.title,
    this.description,
    this.category,
    this.priority,
    this.status,
    this.assignedTo,
    this.estimatedResolutionDate,
    this.actualResolutionDate,
    this.resolutionNotes,
    this.tags,
  });

  factory UpdateReportRequest.fromJson(Map<String, dynamic> json) => _$UpdateReportRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateReportRequestToJson(this);
}
