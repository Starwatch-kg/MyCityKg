import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/register_screen.dart';
import '../../screens/auth/forgot_password_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/report/create_report_screen.dart';
import '../../screens/report/report_details_screen.dart';
import '../../screens/volunteer/volunteer_screen.dart';
import '../../screens/volunteer/create_task_screen.dart';
import '../../screens/volunteer/task_details_screen.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/profile/settings_screen.dart';
import '../../screens/onboarding/onboarding_screen.dart';
import '../../screens/splash/splash_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.value != null;
      final isLoading = authState.isLoading;
      
      // Show splash while loading
      if (isLoading) {
        return '/splash';
      }
      
      // Redirect to login if not authenticated and trying to access protected routes
      if (!isAuthenticated && _isProtectedRoute(state.location)) {
        return '/login';
      }
      
      // Redirect to home if authenticated and trying to access auth routes
      if (isAuthenticated && _isAuthRoute(state.location)) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      // Splash screen
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Onboarding
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      
      // Main app routes
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/volunteer',
            builder: (context, state) => const VolunteerScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      
      // Report routes
      GoRoute(
        path: '/create-report',
        builder: (context, state) => const CreateReportScreen(),
      ),
      GoRoute(
        path: '/report/:id',
        builder: (context, state) {
          final reportId = state.pathParameters['id']!;
          return ReportDetailsScreen(reportId: reportId);
        },
      ),
      
      // Volunteer task routes
      GoRoute(
        path: '/create-task',
        builder: (context, state) => const CreateTaskScreen(),
      ),
      GoRoute(
        path: '/task/:id',
        builder: (context, state) {
          final taskId = state.pathParameters['id']!;
          final task = state.extra as Map<String, dynamic>?;
          return TaskDetailsScreen(
            taskId: taskId,
            task: task,
          );
        },
      ),
      
      // Settings
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Ошибка')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Страница не найдена',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(state.location),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('На главную'),
            ),
          ],
        ),
      ),
    ),
  );
});

// Helper functions
bool _isProtectedRoute(String location) {
  const protectedRoutes = [
    '/home',
    '/volunteer',
    '/profile',
    '/create-report',
    '/create-task',
    '/settings',
  ];
  
  return protectedRoutes.any((route) => location.startsWith(route));
}

bool _isAuthRoute(String location) {
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/onboarding',
  ];
  
  return authRoutes.contains(location);
}

// Main shell with bottom navigation
class MainShell extends ConsumerWidget {
  final Widget child;
  
  const MainShell({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _getCurrentIndex(context),
        onTap: (index) => _onItemTapped(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Главная',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.volunteer_activism_outlined),
            activeIcon: Icon(Icons.volunteer_activism),
            label: 'Волонтерство',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Профиль',
          ),
        ],
      ),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).location;
    
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/volunteer')) return 1;
    if (location.startsWith('/profile')) return 2;
    
    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/volunteer');
        break;
      case 2:
        context.go('/profile');
        break;
    }
  }
}

// Router extension for easy navigation
extension AppRouterExtension on GoRouter {
  void pushCreateReport() {
    push('/create-report');
  }
  
  void pushReportDetails(String reportId) {
    push('/report/$reportId');
  }
  
  void pushCreateTask() {
    push('/create-task');
  }
  
  void pushTaskDetails(String taskId, {Map<String, dynamic>? task}) {
    push('/task/$taskId', extra: task);
  }
  
  void pushSettings() {
    push('/settings');
  }
}
