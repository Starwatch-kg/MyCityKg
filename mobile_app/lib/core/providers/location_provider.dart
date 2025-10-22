import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:permission_handler/permission_handler.dart';

import '../utils/app_constants.dart';

// Location state provider
final locationProvider = StateNotifierProvider<LocationNotifier, AsyncValue<Position?>>((ref) {
  return LocationNotifier();
});

// Current address provider
final currentAddressProvider = StateNotifierProvider<AddressNotifier, AsyncValue<String?>>((ref) {
  return AddressNotifier(ref);
});

// Location permission provider
final locationPermissionProvider = FutureProvider<LocationPermission>((ref) async {
  return await Geolocator.checkPermission();
});

class LocationNotifier extends StateNotifier<AsyncValue<Position?>> {
  LocationNotifier() : super(const AsyncValue.data(null));

  Future<Position?> getCurrentLocation() async {
    state = const AsyncValue.loading();
    
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Службы геолокации отключены');
      }

      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Доступ к геолокации запрещен');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Доступ к геолокации запрещен навсегда. Разрешите доступ в настройках приложения');
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      state = AsyncValue.data(position);
      return position;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return null;
    }
  }

  Future<Position?> getLastKnownLocation() async {
    try {
      final position = await Geolocator.getLastKnownPosition();
      if (position != null) {
        state = AsyncValue.data(position);
      }
      return position;
    } catch (e) {
      return null;
    }
  }

  Future<double> getDistanceBetween(
    double startLatitude,
    double startLongitude,
    double endLatitude,
    double endLongitude,
  ) async {
    return Geolocator.distanceBetween(
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    );
  }

  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    );
  }

  void clearLocation() {
    state = const AsyncValue.data(null);
  }
}

class AddressNotifier extends StateNotifier<AsyncValue<String?>> {
  final Ref _ref;

  AddressNotifier(this._ref) : super(const AsyncValue.data(null)) {
    // Listen to location changes and update address
    _ref.listen(locationProvider, (previous, next) {
      next.whenData((position) {
        if (position != null) {
          getAddressFromCoordinates(position.latitude, position.longitude);
        }
      });
    });
  }

  Future<String?> getAddressFromCoordinates(double latitude, double longitude) async {
    state = const AsyncValue.loading();
    
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        final address = _formatAddress(placemark);
        state = AsyncValue.data(address);
        return address;
      } else {
        state = const AsyncValue.data(null);
        return null;
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return null;
    }
  }

  Future<List<Location>> getCoordinatesFromAddress(String address) async {
    try {
      return await locationFromAddress(address);
    } catch (e) {
      rethrow;
    }
  }

  String _formatAddress(Placemark placemark) {
    final components = <String>[];
    
    if (placemark.street?.isNotEmpty == true) {
      components.add(placemark.street!);
    }
    
    if (placemark.subLocality?.isNotEmpty == true) {
      components.add(placemark.subLocality!);
    }
    
    if (placemark.locality?.isNotEmpty == true) {
      components.add(placemark.locality!);
    }
    
    if (placemark.administrativeArea?.isNotEmpty == true) {
      components.add(placemark.administrativeArea!);
    }
    
    if (placemark.country?.isNotEmpty == true) {
      components.add(placemark.country!);
    }

    return components.join(', ');
  }

  void clearAddress() {
    state = const AsyncValue.data(null);
  }
}

// Location utilities
class LocationUtils {
  static Future<bool> checkLocationPermission() async {
    final permission = await Permission.location.status;
    return permission.isGranted;
  }

  static Future<bool> requestLocationPermission() async {
    final permission = await Permission.location.request();
    return permission.isGranted;
  }

  static Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }

  static Future<void> openAppSettings() async {
    await Geolocator.openAppSettings();
  }

  static bool isLocationWithinBounds(
    Position position,
    double centerLat,
    double centerLng,
    double radiusInMeters,
  ) {
    final distance = Geolocator.distanceBetween(
      position.latitude,
      position.longitude,
      centerLat,
      centerLng,
    );
    return distance <= radiusInMeters;
  }

  static String formatDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.round()} м';
    } else {
      final km = distanceInMeters / 1000;
      return '${km.toStringAsFixed(1)} км';
    }
  }

  static String getLocationAccuracyDescription(LocationAccuracy accuracy) {
    switch (accuracy) {
      case LocationAccuracy.lowest:
        return 'Очень низкая точность (~3000м)';
      case LocationAccuracy.low:
        return 'Низкая точность (~1000м)';
      case LocationAccuracy.medium:
        return 'Средняя точность (~100м)';
      case LocationAccuracy.high:
        return 'Высокая точность (~10м)';
      case LocationAccuracy.best:
        return 'Максимальная точность (~3м)';
      case LocationAccuracy.bestForNavigation:
        return 'Навигационная точность (~1м)';
      default:
        return 'Неизвестная точность';
    }
  }

  static bool isValidCoordinate(double? latitude, double? longitude) {
    if (latitude == null || longitude == null) return false;
    
    return latitude >= -90 && 
           latitude <= 90 && 
           longitude >= -180 && 
           longitude <= 180;
  }

  static Map<String, double> getBoundingBox(
    double centerLat,
    double centerLng,
    double radiusInMeters,
  ) {
    // Approximate conversion (not exact due to Earth's curvature)
    final latDelta = radiusInMeters / 111320; // meters per degree latitude
    final lngDelta = radiusInMeters / (111320 * math.cos(centerLat * math.pi / 180));

    return {
      'minLat': centerLat - latDelta,
      'maxLat': centerLat + latDelta,
      'minLng': centerLng - lngDelta,
      'maxLng': centerLng + lngDelta,
    };
  }
}

// Import math for calculations
import 'dart:math' as math;
