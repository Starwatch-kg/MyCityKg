import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Clock, ThumbsUp, MessageCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const typeEmojis = {
  'мусор': '🗑️',
  'освещение': '💡',
  'дороги': '🛣️',
  'вода': '💧',
  'запах': '👃',
  'другое': '📝'
}

const statusColors = {
  'новое': { bg: '#FFD43B20', text: '#FFD43B' },
  'в работе': { bg: '#FF980020', text: '#FF9800' },
  'решено': { bg: '#4CAF5020', text: '#4CAF50' },
}

const MyIssues = () => {
  const navigate = useNavigate()
  const issues = useSelector(state => state.issues.issues)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дней назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="min-h-screen bg-background pb-4">
      {/* Header */}
      <div className="bg-accent/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 sticky top-0 z-50 shadow-lg safe-area-top">
        <div className="px-4 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Мои жалобы</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Всего обращений: {issues.length}</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-3 sm:p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">У вас пока нет обращений</p>
            <button
              onClick={() => navigate('/add')}
              className="bg-primary text-accent px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Добавить первую жалобу
            </button>
          </div>
        ) : (
          issues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/issue/${issue.id}`)}
              className="bg-surface rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative overflow-hidden rounded-xl">
                  <img
                    src={issue.photo}
                    alt={issue.title}
                    className="w-full h-full object-cover transition-transform hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 truncate">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {issue.address}
                  </p>
                  
                  {/* Status and Date */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: statusColors[issue.status].bg,
                        color: statusColors[issue.status].text,
                      }}
                    >
                      {issue.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(issue.date)}
                    </span>
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {issue.reactions.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {issue.reactions.comments}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        </div>
      </div>
    </div>
  )
}

export default MyIssues
