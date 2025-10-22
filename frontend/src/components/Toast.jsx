import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
  }

  const colors = {
    success: 'bg-green-500/90',
    error: 'bg-red-500/90',
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-sm w-full mx-4"
        >
          <div className={`${colors[type]} backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/10`}>
            <div className="flex items-center gap-3">
              <Icon size={24} className="text-white flex-shrink-0" />
              <p className="text-white font-medium text-sm leading-relaxed flex-1">
                {message}
              </p>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
