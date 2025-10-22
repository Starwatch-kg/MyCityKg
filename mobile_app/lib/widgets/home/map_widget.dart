import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/app_constants.dart';

class MapWidget extends StatefulWidget {
  final LatLng initialPosition;
  final List<dynamic> reports;
  final Function(Map<String, dynamic>)? onReportTap;
  final Function(LatLng)? onMapTap;
  final bool showUserLocation;
  final double zoom;

  const MapWidget({
    super.key,
    required this.initialPosition,
    this.reports = const [],
    this.onReportTap,
    this.onMapTap,
    this.showUserLocation = true,
    this.zoom = AppConstants.defaultZoom,
  });

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  GoogleMapController? _controller;
  Set<Marker> _markers = {};
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    _createMarkers();
    if (widget.showUserLocation) {
      _getCurrentLocation();
    }
  }

  @override
  void didUpdateWidget(MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.reports != widget.reports) {
      _createMarkers();
    }
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = position;
      });
    } catch (e) {
      // Handle location error silently
    }
  }

  void _createMarkers() {
    final markers = <Marker>{};

    // Add user location marker
    if (_currentPosition != null && widget.showUserLocation) {
      markers.add(
        Marker(
          markerId: const MarkerId('user_location'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(
            title: 'Ваше местоположение',
          ),
        ),
      );
    }

    // Add report markers
    for (int i = 0; i < widget.reports.length; i++) {
      final report = widget.reports[i];
      final location = report['location'];
      
      if (location != null && location['coordinates'] != null) {
        final coordinates = location['coordinates'] as List<dynamic>;
        if (coordinates.length >= 2) {
          final lat = coordinates[1].toDouble();
          final lng = coordinates[0].toDouble();
          
          markers.add(
            Marker(
              markerId: MarkerId('report_$i'),
              position: LatLng(lat, lng),
              icon: _getMarkerIcon(report['category'], report['status']),
              infoWindow: InfoWindow(
                title: report['title'] ?? 'Без названия',
                snippet: report['category'] ?? 'Другое',
                onTap: () {
                  if (widget.onReportTap != null) {
                    widget.onReportTap!(report);
                  }
                },
              ),
              onTap: () {
                if (widget.onReportTap != null) {
                  widget.onReportTap!(report);
                }
              },
            ),
          );
        }
      }
    }

    setState(() {
      _markers = markers;
    });
  }

  BitmapDescriptor _getMarkerIcon(String? category, String? status) {
    // Different colors based on status
    double hue = BitmapDescriptor.hueRed; // Default for new reports
    
    switch (status) {
      case 'new':
        hue = BitmapDescriptor.hueRed;
        break;
      case 'in_progress':
        hue = BitmapDescriptor.hueOrange;
        break;
      case 'resolved':
        hue = BitmapDescriptor.hueGreen;
        break;
      case 'rejected':
        hue = BitmapDescriptor.hueViolet;
        break;
      default:
        hue = BitmapDescriptor.hueRed;
    }

    return BitmapDescriptor.defaultMarkerWithHue(hue);
  }

  void _onMapCreated(GoogleMapController controller) {
    _controller = controller;
    
    // Apply custom map style if needed
    _setMapStyle();
  }

  Future<void> _setMapStyle() async {
    try {
      // You can add custom map styling here
      // const String mapStyle = '[]'; // Your custom style JSON
      // await _controller?.setMapStyle(mapStyle);
    } catch (e) {
      // Handle styling error
    }
  }

  Future<void> animateToPosition(LatLng position) async {
    await _controller?.animateCamera(
      CameraUpdate.newLatLngZoom(position, widget.zoom),
    );
  }

  Future<void> animateToCurrentLocation() async {
    if (_currentPosition != null) {
      await animateToPosition(
        LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GoogleMap(
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: widget.initialPosition,
            zoom: widget.zoom,
          ),
          markers: _markers,
          onTap: widget.onMapTap,
          myLocationEnabled: widget.showUserLocation,
          myLocationButtonEnabled: false, // We'll add custom button
          compassEnabled: true,
          mapToolbarEnabled: false,
          zoomControlsEnabled: false,
          minMaxZoomPreference: const MinMaxZoomPreference(
            AppConstants.minZoom,
            AppConstants.maxZoom,
          ),
          mapType: MapType.normal,
        ),
        
        // Custom controls
        Positioned(
          top: 16,
          right: 16,
          child: Column(
            children: [
              // Map type button
              FloatingActionButton(
                mini: true,
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                onPressed: _showMapTypeDialog,
                child: const Icon(Icons.layers_outlined),
              ),
              
              const SizedBox(height: 8),
              
              // Current location button
              if (widget.showUserLocation)
                FloatingActionButton(
                  mini: true,
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  onPressed: animateToCurrentLocation,
                  child: const Icon(Icons.my_location_outlined),
                ),
            ],
          ),
        ),
        
        // Legend
        Positioned(
          bottom: 16,
          left: 16,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Легенда',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                _buildLegendItem('Новая', Colors.red),
                _buildLegendItem('В работе', Colors.orange),
                _buildLegendItem('Решена', Colors.green),
                _buildLegendItem('Отклонена', Colors.purple),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  void _showMapTypeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Тип карты'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Обычная'),
              onTap: () {
                _controller?.setMapType(MapType.normal);
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              title: const Text('Спутник'),
              onTap: () {
                _controller?.setMapType(MapType.satellite);
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              title: const Text('Гибрид'),
              onTap: () {
                _controller?.setMapType(MapType.hybrid);
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              title: const Text('Рельеф'),
              onTap: () {
                _controller?.setMapType(MapType.terrain);
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
}
