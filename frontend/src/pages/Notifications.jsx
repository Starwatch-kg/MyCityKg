import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronLeft, Bell, CheckCheck, Trash2, AlertCircle, MessageCircle, CheckCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { markNotificationRead, markAllNotificationsRead, clearNotifications } from '../store/slices/notificationsSlice'
import { useTranslation } from '../i18n/useTranslation'

const Notifications = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const notifications = useSelector(state => state.notifications.items)
  const [filter, setFilter] = useState('all') // all, unread, read

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'statusUpdate':
        return AlertCircle
      case 'newComment':
        return MessageCircle
      case 'resolved':
        return CheckCircle
      case 'inProgress':
        return Clock
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'resolved':
        return 'text-green-400'
      case 'inProgress':
        return 'text-blue-400'
      case 'newComment':
        return 'text-purple-400'
      default:
        return 'text-primary'
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`
    return time.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent border-b border-surface-light sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{t('notifications.title')}</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400">{unreadCount} непрочитанных</p>
                )}
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                    title={t('notifications.markAllRead')}
                  >
                    <CheckCheck size={20} className="text-primary" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Очистить все уведомления?')) {
                      dispatch(clearNotifications())
                    }
                  }}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                  title={t('notifications.clear')}
                >
                  <Trash2 size={20} className="text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface text-gray-400 hover:bg-surface-light'
                }`}
              >
                {f === 'all' ? 'Все' : f === 'unread' ? 'Непрочитанные' : 'Прочитанные'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t('notifications.empty')}</h2>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? 'Нет непрочитанных уведомлений' 
                : filter === 'read'
                ? 'Нет прочитанных уведомлений'
                : 'У вас пока нет уведомлений'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type)
                const colorClass = getNotificationColor(notification.type)

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (!notification.read) {
                        dispatch(markNotificationRead(notification.id))
                      }
                      if (notification.issueId) {
                        navigate(`/issue/${notification.issueId}`)
                      }
                    }}
                    className={`bg-accent rounded-2xl p-4 border transition-all cursor-pointer ${
                      notification.read
                        ? 'border-surface-light hover:border-surface-light/50'
                        : 'border-primary/30 hover:border-primary/50 bg-primary/5'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl bg-surface ${colorClass}`}>
                        <Icon size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
