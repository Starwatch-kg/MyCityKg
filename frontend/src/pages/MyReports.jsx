import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronLeft, MapPin, Calendar, Eye, ThumbsUp, MessageCircle, Filter, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchIssues } from '../store/slices/issuesSlice'
import { useTranslation } from '../i18n/useTranslation'

const MyReports = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const issues = useSelector(state => state.issues.issues)
  const loading = useSelector(state => state.issues.loading)
  const user = useSelector(state => state.auth.user)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Фильтруем жалобы пользователя
  // Временно показываем все жалобы, так как нет аутентификации
  const myReports = Array.isArray(issues) ? issues : []

  // Применяем фильтры
  const filteredReports = myReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    dispatch(fetchIssues())
  }, [dispatch])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'in_progress': return 'В работе'
      case 'resolved': return 'Решено'
      case 'rejected': return 'Отклонено'
      default: return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'resolved', label: 'Решено' },
    { value: 'rejected', label: 'Отклонено' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent/95 backdrop-blur-sm p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Мои жалобы</h1>
            <p className="text-sm text-gray-300">
              {myReports.length} {myReports.length === 1 ? 'жалоба' : myReports.length < 5 ? 'жалобы' : 'жалоб'}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <Filter size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-surface border-b border-surface-light overflow-hidden"
          >
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по жалобам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      statusFilter === option.value
                        ? 'bg-primary text-white'
                        : 'bg-background text-gray-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {myReports.length === 0 ? 'У вас пока нет жалоб' : 'Жалобы не найдены'}
            </h3>
            <p className="text-gray-400 mb-6">
              {myReports.length === 0 
                ? 'Создайте первую жалобу, чтобы помочь улучшить ваш город'
                : 'Попробуйте изменить фильтры поиска'
              }
            </p>
            {myReports.length === 0 && (
              <button
                onClick={() => navigate('/add-issue')}
                className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Создать жалобу
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/issue/${report.id}`)}
                className="bg-surface rounded-2xl p-4 border border-surface-light hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  {report.images && report.images.length > 0 ? (
                    <img
                      src={report.images[0]}
                      alt={report.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-background rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                        {report.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{report.viewsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        <span>{report.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        <span>{report.commentsCount || 0}</span>
                      </div>
                    </div>

                    {report.address && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="truncate">{report.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReports
