import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? avatar;
  final String role;
  final bool isActive;
  final bool isEmailVerified;
  final LocationData? location;
  final String? address;
  final UserPreferences preferences;
  final UserStats stats;
  final List<String> fcmTokens;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phone,
    this.avatar,
    required this.role,
    required this.isActive,
    required this.isEmailVerified,
    this.location,
    this.address,
    required this.preferences,
    required this.stats,
    required this.fcmTokens,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  String get fullName => '$firstName $lastName';

  bool get isVolunteer => ['volunteer', 'moderator', 'admin'].contains(role);
  bool get isModerator => ['moderator', 'admin'].contains(role);
  bool get isAdmin => role == 'admin';

  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phone,
    String? avatar,
    String? role,
    bool? isActive,
    bool? isEmailVerified,
    LocationData? location,
    String? address,
    UserPreferences? preferences,
    UserStats? stats,
    List<String>? fcmTokens,
    DateTime? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      location: location ?? this.location,
      address: address ?? this.address,
      preferences: preferences ?? this.preferences,
      stats: stats ?? this.stats,
      fcmTokens: fcmTokens ?? this.fcmTokens,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
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
class UserPreferences {
  final NotificationPreferences notifications;
  final String language;
  final String theme;

  UserPreferences({
    required this.notifications,
    required this.language,
    required this.theme,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);

  UserPreferences copyWith({
    NotificationPreferences? notifications,
    String? language,
    String? theme,
  }) {
    return UserPreferences(
      notifications: notifications ?? this.notifications,
      language: language ?? this.language,
      theme: theme ?? this.theme,
    );
  }
}

@JsonSerializable()
class NotificationPreferences {
  final bool email;
  final bool push;
  final bool sms;

  NotificationPreferences({
    required this.email,
    required this.push,
    required this.sms,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) => _$NotificationPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationPreferencesToJson(this);

  NotificationPreferences copyWith({
    bool? email,
    bool? push,
    bool? sms,
  }) {
    return NotificationPreferences(
      email: email ?? this.email,
      push: push ?? this.push,
      sms: sms ?? this.sms,
    );
  }
}

@JsonSerializable()
class UserStats {
  final int reportsSubmitted;
  final int reportsResolved;
  final double volunteerHours;
  final int tasksCompleted;
  final double rating;

  UserStats({
    required this.reportsSubmitted,
    required this.reportsResolved,
    required this.volunteerHours,
    required this.tasksCompleted,
    required this.rating,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => _$UserStatsFromJson(json);
  Map<String, dynamic> toJson() => _$UserStatsToJson(this);

  UserStats copyWith({
    int? reportsSubmitted,
    int? reportsResolved,
    double? volunteerHours,
    int? tasksCompleted,
    double? rating,
  }) {
    return UserStats(
      reportsSubmitted: reportsSubmitted ?? this.reportsSubmitted,
      reportsResolved: reportsResolved ?? this.reportsResolved,
      volunteerHours: volunteerHours ?? this.volunteerHours,
      tasksCompleted: tasksCompleted ?? this.tasksCompleted,
      rating: rating ?? this.rating,
    );
  }
}
