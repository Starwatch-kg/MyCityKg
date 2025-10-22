import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronLeft, Camera, User, Mail, Phone, FileText, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { updateUser } from '../store/slices/authSlice'

const EditProfile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null,
  })

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updateUser(formData))
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent border-b border-surface-light sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Редактировать профиль</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-surface border-4 border-primary shadow-2xl">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-gray-400 text-sm mt-3">Нажмите на камеру чтобы изменить фото</p>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Имя *
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ваше имя"
                required
                className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email *
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
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Телефон
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+996 XXX XXX XXX"
                className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-2">
              О себе
            </label>
            <div className="relative">
              <FileText size={20} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Расскажите о себе..."
                rows={4}
                maxLength={200}
                className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.bio.length}/200
            </p>
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            type="submit"
            className="w-full bg-primary text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Сохранить изменения
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
