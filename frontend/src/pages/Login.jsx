import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { setUser } from '../store/slices/authSlice'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Временная авторизация (позже добавим API)
    const user = {
      id: '1',
      email: formData.email,
      name: formData.email.split('@')[0],
      avatar: null,
      bio: '',
      phone: '',
      createdAt: new Date().toISOString(),
    }
    
    dispatch(setUser(user))
    localStorage.setItem('user', JSON.stringify(user))
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-primary mb-2"
          >
            MyCityKg
          </motion.h1>
          <p className="text-gray-400">Моя страна - моя ответственность</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-accent rounded-2xl p-6 sm:p-8 border border-surface-light shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Вход</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface text-white pl-10 pr-12 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => alert('Функция восстановления пароля в разработке')}
                className="text-sm text-primary hover:underline"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Войти
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Нет аккаунта?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary font-medium hover:underline"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>

          {/* Guest Mode */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-surface text-gray-400 rounded-xl font-medium hover:bg-surface-light transition-colors"
            >
              Продолжить как гость
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
