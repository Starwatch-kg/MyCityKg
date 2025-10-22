import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

import '../../core/providers/location_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/app_constants.dart';
import '../../widgets/common/custom_app_bar.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/report/category_selector.dart';
import '../../widgets/report/priority_selector.dart';
import '../../widgets/report/image_picker_widget.dart';
import '../../widgets/report/location_picker.dart';

class CreateReportScreen extends ConsumerStatefulWidget {
  const CreateReportScreen({super.key});

  @override
  ConsumerState<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends ConsumerState<CreateReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String _selectedCategory = AppConstants.reportCategories.first;
  String _selectedPriority = 'medium';
  List<XFile> _selectedImages = [];
  Position? _selectedLocation;
  String? _selectedAddress;
  bool _isAnonymous = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await ref.read(locationProvider.notifier).getCurrentLocation();
      if (position != null) {
        setState(() {
          _selectedLocation = position;
        });
        await _getAddressFromCoordinates(position);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка определения местоположения: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _getAddressFromCoordinates(Position position) async {
    try {
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        final address = [
          placemark.street,
          placemark.locality,
          placemark.administrativeArea,
        ].where((element) => element != null && element.isNotEmpty).join(', ');
        
        setState(() {
          _selectedAddress = address;
        });
      }
    } catch (e) {
      // Ignore geocoding errors
    }
  }

  Future<void> _pickImages() async {
    try {
      final ImagePicker picker = ImagePicker();
      final List<XFile> images = await picker.pickMultiImage(
        maxWidth: AppConstants.maxImageWidth,
        maxHeight: AppConstants.maxImageHeight,
        imageQuality: AppConstants.imageQuality,
      );

      if (images.isNotEmpty) {
        // Check file sizes
        final validImages = <XFile>[];
        for (final image in images) {
          final file = File(image.path);
          final fileSize = await file.length();
          
          if (fileSize <= AppConstants.maxImageSize) {
            validImages.add(image);
          } else {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Файл ${image.name} слишком большой'),
                  backgroundColor: AppColors.warning,
                ),
              );
            }
          }
        }

        setState(() {
          _selectedImages.addAll(validImages);
          // Limit to 5 images
          if (_selectedImages.length > 5) {
            _selectedImages = _selectedImages.take(5).toList();
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка выбора изображений: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _takePhoto() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.camera,
        maxWidth: AppConstants.maxImageWidth,
        maxHeight: AppConstants.maxImageHeight,
        imageQuality: AppConstants.imageQuality,
      );

      if (image != null) {
        final file = File(image.path);
        final fileSize = await file.length();
        
        if (fileSize <= AppConstants.maxImageSize) {
          setState(() {
            _selectedImages.add(image);
            // Limit to 5 images
            if (_selectedImages.length > 5) {
              _selectedImages = _selectedImages.take(5).toList();
            }
          });
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Файл слишком большой'),
                backgroundColor: AppColors.warning,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка съемки: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Необходимо указать местоположение'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final reportData = {
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'category': _selectedCategory,
        'priority': _selectedPriority,
        'location': {
          'type': 'Point',
          'coordinates': [
            _selectedLocation!.longitude,
            _selectedLocation!.latitude,
          ],
        },
        'address': _selectedAddress,
        'isAnonymous': _isAnonymous,
        'images': _selectedImages,
      };

      await ref.read(reportsProvider.notifier).createReport(reportData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(AppConstants.reportSubmittedMessage),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка отправки: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Сообщить о проблеме',
        showBackButton: true,
      ),
      body: _isSubmitting
          ? const LoadingWidget(message: 'Отправка сообщения...')
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title field
                    CustomTextField(
                      controller: _titleController,
                      label: 'Заголовок',
                      hint: 'Кратко опишите проблему',
                      maxLength: AppConstants.maxTitleLength,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Заголовок обязателен';
                        }
                        if (value.trim().length < 5) {
                          return 'Заголовок должен содержать минимум 5 символов';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Description field
                    CustomTextField(
                      controller: _descriptionController,
                      label: 'Описание',
                      hint: 'Подробно опишите проблему',
                      maxLines: 4,
                      maxLength: AppConstants.maxDescriptionLength,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Описание обязательно';
                        }
                        if (value.trim().length < AppConstants.minDescriptionLength) {
                          return 'Описание должно содержать минимум ${AppConstants.minDescriptionLength} символов';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Category selector
                    Text(
                      'Категория',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    CategorySelector(
                      selectedCategory: _selectedCategory,
                      onCategorySelected: (category) {
                        setState(() {
                          _selectedCategory = category;
                        });
                      },
                    ),
                    const SizedBox(height: 24),

                    // Priority selector
                    Text(
                      'Приоритет',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    PrioritySelector(
                      selectedPriority: _selectedPriority,
                      onPrioritySelected: (priority) {
                        setState(() {
                          _selectedPriority = priority;
                        });
                      },
                    ),
                    const SizedBox(height: 24),

                    // Location picker
                    Text(
                      'Местоположение',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    LocationPicker(
                      selectedLocation: _selectedLocation,
                      selectedAddress: _selectedAddress,
                      onLocationSelected: (position, address) {
                        setState(() {
                          _selectedLocation = position;
                          _selectedAddress = address;
                        });
                      },
                    ),
                    const SizedBox(height: 24),

                    // Image picker
                    Text(
                      'Фотографии (необязательно)',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ImagePickerWidget(
                      selectedImages: _selectedImages,
                      onPickImages: _pickImages,
                      onTakePhoto: _takePhoto,
                      onRemoveImage: _removeImage,
                    ),
                    const SizedBox(height: 24),

                    // Anonymous checkbox
                    CheckboxListTile(
                      title: const Text('Анонимная жалоба'),
                      subtitle: const Text(
                        'Ваше имя не будет отображаться в сообщении',
                      ),
                      value: _isAnonymous,
                      onChanged: (value) {
                        setState(() {
                          _isAnonymous = value ?? false;
                        });
                      },
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
                    const SizedBox(height: 32),

                    // Submit button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitReport,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Отправить сообщение',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Info text
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.info.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.info.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: AppColors.info,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Ваше сообщение будет рассмотрено в течение 24 часов. '
                              'Вы получите уведомление о статусе рассмотрения.',
                              style: TextStyle(
                                color: AppColors.info,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
