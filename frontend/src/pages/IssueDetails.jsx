import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronLeft, MapPin, Calendar, ThumbsUp, MessageCircle, Share2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { likeIssue } from '../store/slices/issuesSlice'

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

const IssueDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const issue = useSelector(state => state.issues.issues.find(i => i.id === id))

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Обращение не найдено</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-accent px-6 py-3 rounded-xl font-medium"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleLike = () => {
    dispatch(likeIssue(issue.id))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href,
      })
    } else {
      alert('Функция поделиться недоступна в вашем браузере')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-accent/95 backdrop-blur-sm shadow-lg safe-area-top">
        <div className="p-3 sm:p-4 flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <Share2 size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-48 sm:h-64 md:h-80 overflow-hidden"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.7 }}
          src={issue.photo}
          alt={issue.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 -mt-8 relative z-10 max-w-4xl mx-auto">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        >
          <span
            className="inline-block px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: statusColors[issue.status].bg,
              color: statusColors[issue.status].text,
            }}
          >
            {issue.status}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-white"
        >
          {issue.title}
        </motion.h1>

        {/* Meta Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin size={18} className="text-primary" />
            <span>{issue.address}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={18} className="text-primary" />
            <span>{formatDate(issue.date)}</span>
          </div>
        </motion.div>

        {/* Description */}
        {issue.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Описание</h2>
            <p className="text-gray-300 leading-relaxed">{issue.description}</p>
          </motion.div>
        )}

        {/* Response */}
        {issue.response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-primary mb-2">
              Ответ службы
            </h2>
            <p className="text-gray-300 leading-relaxed">{issue.response}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <button
            onClick={handleLike}
            className="flex-1 bg-surface rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-surface-light transition-colors"
          >
            <ThumbsUp size={20} className="text-primary" />
            <span className="text-white font-medium">{issue.reactions.likes}</span>
          </button>
          <button className="flex-1 bg-surface rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-surface-light transition-colors">
            <MessageCircle size={20} className="text-primary" />
            <span className="text-white font-medium">{issue.reactions.comments}</span>
          </button>
        </motion.div>

        {/* Type Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <span className="inline-block bg-surface px-4 py-2 rounded-xl text-sm text-gray-400">
            Категория: <span className="text-white font-medium">{issue.type}</span>
          </span>
        </motion.div>
      </div>
    </div>
  )
}

export default IssueDetails
