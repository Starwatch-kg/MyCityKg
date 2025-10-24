import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Edit, LogOut, User as UserIcon, Settings, Bell, 
  Award, TrendingUp, Calendar, MapPin, Clock, CheckCircle,
  AlertCircle, XCircle, List, FileText
} from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/useTranslation'

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const issues = useSelector(state => state.issues.issues)
  const notifications = useSelector(state => state.notifications.items)
  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    if (confirm(t('auth.logoutConfirm'))) {
      dispatch(logout())
      navigate('/login')
    }
  }

  // Расширенная статистика
  const issuesArray = Array.isArray(issues) ? issues : []
  const totalIssues = issuesArray.length
  const inProgressIssues = issuesArray.filter(i => i.status === 'в работе').length
  const resolvedIssues = issuesArray.filter(i => i.status === 'решено').length
  const newIssues = issuesArray.filter(i => i.status === 'новая').length
  const rejectedIssues = issuesArray.filter(i => i.status === 'отклонено').length
  
  const stats = [
    { label: t('profile.stats.total'), value: totalIssues, icon: List, color: 'text-blue-400' },
    { label: t('profile.stats.inProgress'), value: inProgressIssues, icon: Clock, color: 'text-yellow-500' },
    { label: t('profile.stats.resolved'), value: resolvedIssues, icon: CheckCircle, color: 'text-green-400' },
    { label: t('profile.stats.new'), value: newIssues, icon: AlertCircle, color: 'text-purple-400' },
  ]
  
  // Достижения
  const achievements = [
    { 
      id: 1, 
      title: t('profile.achievements.firstStep'), 
      description: t('profile.achievements.firstStepDesc'), 
      icon: '🎯',
      unlocked: totalIssues >= 1,
      progress: Math.min(totalIssues, 1)
    },
    { 
      id: 2, 
      title: t('profile.achievements.activist'), 
      description: t('profile.achievements.activistDesc'), 
      icon: '⭐',
      unlocked: totalIssues >= 5,
      progress: Math.min(totalIssues / 5, 1)
    },
    { 
      id: 3, 
      title: t('profile.achievements.cityHero'), 
      description: t('profile.achievements.cityHeroDesc'), 
      icon: '🏆',
      unlocked: totalIssues >= 10,
      progress: Math.min(totalIssues / 10, 1)
    },
    { 
      id: 4, 
      title: t('profile.achievements.solver'), 
      description: t('profile.achievements.solverDesc'), 
      icon: '✅',
      unlocked: resolvedIssues >= 5,
      progress: Math.min(resolvedIssues / 5, 1)
    },
  ]
  
  // Последние жалобы
  const recentIssues = issuesArray.slice(0, 3)
  
  // Дата регистрации
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long' 
  }) : t('profile.recentlyJoined')

  const quickActions = [
    {
      icon: FileText,
      label: 'Мои жалобы',
      badge: totalIssues,
      action: () => navigate('/my-reports'),
    },
    {
      icon: Bell,
      label: t('nav.notifications'),
      badge: unreadCount,
      action: () => navigate('/notifications'),
    },
    {
      icon: Settings,
      label: t('nav.settings'),
      action: () => navigate('/settings'),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 sticky top-0 z-50 shadow-lg safe-area-top">
        <div className="px-4 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t('profile.title')}</h1>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-gradient-to-br from-surface via-surface-light to-surface rounded-2xl p-4 sm:p-6 text-center border border-surface-light relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-2xl relative overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={32} className="text-white" />
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          </motion.div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{user?.name || t('profile.user')}</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-1">{user?.email || t('profile.guest')}</p>
          
          {/* Member Since */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
            <Calendar size={12} />
            <span>{t('profile.memberSince')} {memberSince}</span>
          </div>
          
          {user?.bio && (
            <p className="text-gray-300 text-sm mb-3 px-2">{user.bio}</p>
          )}
          
          {/* User Level */}
          <div className="bg-surface/50 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{t('profile.level')}</span>
              <span className="text-sm font-bold text-primary">{Math.floor(totalIssues / 2) + 1}</span>
            </div>
            <div className="w-full bg-surface-light rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-red-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((totalIssues % 2) / 2) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalIssues % 2}/2 {t('profile.nextLevel')}</p>
          </div>
          
          {/* Edit Button */}
          {isAuthenticated && (
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full mt-3 bg-surface hover:bg-surface-light text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Edit size={16} />
              {t('profile.editProfile')}
            </button>
          )}
          
          {/* Login/Logout Button */}
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full mt-3 bg-primary hover:bg-red-600 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Войти
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full mt-3 bg-surface hover:bg-red-600/20 text-red-400 hover:text-red-300 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Выйти
            </button>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Статистика
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="bg-gradient-to-br from-surface to-surface-light rounded-xl p-4 border border-surface-light hover:border-primary/30 transition-all"
                  >
                    <Icon size={20} className={`${stat.color} mb-2`} />
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
          
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Award size={20} className="text-primary" />
              Достижения
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br rounded-xl p-4 border transition-all ${
                    achievement.unlocked
                      ? 'from-primary/20 to-surface border-primary/30'
                      : 'from-surface to-surface-light border-surface-light opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-bold text-white mb-1">{achievement.title}</div>
                  <div className="text-xs text-gray-400 mb-2">{achievement.description}</div>
                  {!achievement.unlocked && (
                    <div className="w-full bg-surface-light rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${achievement.progress * 100}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Recent Issues */}
          {recentIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  Последние жалобы
                </h3>
                <button
                  onClick={() => navigate('/my-reports')}
                  className="text-sm text-primary hover:underline"
                >
                  Все жалобы →
                </button>
              </div>
              <div className="space-y-2">
                {recentIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={() => navigate(`/issue/${issue.id}`)}
                    className="bg-surface rounded-xl p-4 border border-surface-light hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{issue.emoji}</span>
                          <h4 className="font-semibold text-white truncate">{issue.title}</h4>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">{issue.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {issue.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        issue.status === 'решено' ? 'bg-green-500/20 text-green-400' :
                        issue.status === 'в работе' ? 'bg-yellow-500/20 text-yellow-500' :
                        issue.status === 'отклонено' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions - Full Width */}
        <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="bg-gradient-to-br from-surface to-surface-light rounded-2xl p-4 sm:p-6 border border-surface-light hover:border-primary/30 transition-all relative"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="relative">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon size={24} className="text-primary" />
                    </div>
                    {action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {action.badge > 9 ? '9+' : action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium text-sm">{action.label}</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        </div>
      </div>
    </div>
  )
}

export default Profile
