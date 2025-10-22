import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Eye, Leaf, ChevronRight } from 'lucide-react'
import { completeOnboarding } from '../store/slices/appSlice'

const slides = [
  {
    icon: MapPin,
    title: 'Добро пожаловать в MyCityKg',
    description: 'Сообщайте о проблемах в вашем городе',
    color: '#FFD43B',
  },
  {
    icon: Eye,
    title: 'Следите за статусом',
    description: 'Следите за статусом обращений в реальном времени',
    color: '#FF9800',
  },
  {
    icon: Leaf,
    title: 'Экология района',
    description: 'Получайте экологическую информацию о вашем районе',
    color: '#4CAF50',
  },
]

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      handleStart()
    }
  }

  const handleSkip = () => {
    handleStart()
  }

  const handleStart = () => {
    dispatch(completeOnboarding())
    navigate('/')
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen min-h-dvh bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Skip button */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm sm:max-w-md px-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8 inline-block relative"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center relative"
                style={{ 
                  background: `linear-gradient(135deg, ${slide.color}40, ${slide.color}20)`,
                  boxShadow: `0 8px 32px ${slide.color}40, 0 0 0 8px ${slide.color}10`
                }}
              >
                <Icon size={window.innerWidth < 640 ? 48 : 64} style={{ color: slide.color }} strokeWidth={1.5} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
              </motion.div>
              
              {/* Decorative circles */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: slide.color }}
              />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators and buttons */}
      <div className="px-4 sm:px-6 pb-8 sm:pb-12">
        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-surface-light'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30"
        >
          {currentSlide < slides.length - 1 ? 'Далее' : 'Начать'}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ChevronRight size={20} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}

export default Onboarding
