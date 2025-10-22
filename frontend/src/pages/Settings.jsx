import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  ChevronLeft, Globe, Bell, UserX, Moon, Sun, Monitor, 
  HelpCircle, Shield, Info, ChevronRight, Check 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleNotifications, toggleAnonymousMode, setLanguage, setTheme } from '../store/slices/appSlice'
import { useTranslation } from '../i18n/useTranslation'

const Settings = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { notificationsEnabled, anonymousMode, language, theme } = useSelector(state => state.app)
  
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)

  const languages = [
    { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'kg', name: 'Кыргызча', nativeName: 'Кыргызча', flag: '🇰🇬' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  ]

  const themes = [
    { value: 'light', label: t('settings.themeLight'), icon: Sun },
    { value: 'dark', label: t('settings.themeDark'), icon: Moon },
    { value: 'auto', label: t('settings.themeAuto'), icon: Monitor },
  ]

  const settingsSections = [
    {
      title: 'Основные',
      items: [
        {
          icon: Globe,
          label: t('settings.language'),
          value: languages.find(l => l.code === language)?.nativeName,
          action: () => setShowLanguageModal(true),
        },
        {
          icon: theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor,
          label: t('settings.theme'),
          value: themes.find(th => th.value === theme)?.label,
          action: () => setShowThemeModal(true),
        },
      ],
    },
    {
      title: 'Приватность',
      items: [
        {
          icon: Bell,
          label: t('settings.notifications'),
          description: t('settings.notificationsDesc'),
          toggle: true,
          value: notificationsEnabled,
          action: () => dispatch(toggleNotifications()),
        },
        {
          icon: UserX,
          label: t('settings.anonymousMode'),
          description: t('settings.anonymousModeDesc'),
          toggle: true,
          value: anonymousMode,
          action: () => dispatch(toggleAnonymousMode()),
        },
      ],
    },
    {
      title: 'Информация',
      items: [
        {
          icon: HelpCircle,
          label: t('settings.help'),
          action: () => alert('Раздел в разработке'),
        },
        {
          icon: Shield,
          label: t('settings.privacy'),
          action: () => alert('Раздел в разработке'),
        },
        {
          icon: Info,
          label: t('settings.about'),
          value: 'v1.0.0',
          action: () => alert('MyCityKg v1.0.0\nМоя страна - моя ответственность'),
        },
      ],
    },
  ]

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
          <h1 className="text-xl font-bold text-white">{t('settings.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-accent rounded-2xl border border-surface-light overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-surface-light">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                {section.title}
              </h2>
            </div>

            <div className="divide-y divide-surface-light">
              {section.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full px-4 py-4 flex items-center gap-4 hover:bg-surface transition-colors text-left"
                  >
                    <div className="p-2 bg-surface rounded-xl">
                      <Icon size={20} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-0.5">{item.description}</p>
                      )}
                    </div>

                    {item.toggle ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          item.action()
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          item.value ? 'bg-primary' : 'bg-surface-light'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : item.value ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">{item.value}</span>
                        <ChevronRight size={20} />
                      </div>
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[10000]"
              onClick={() => setShowLanguageModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[10001] flex justify-center safe-area-bottom"
            >
              <div className="w-full max-w-md mx-4">
                <div className="bg-accent rounded-t-3xl p-6 border border-surface-light shadow-2xl">
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
                  
                  <h2 className="text-xl font-bold text-white mb-4">{t('settings.selectLanguage')}</h2>
                  
                  <div className="space-y-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          dispatch(setLanguage(lang.code))
                          setShowLanguageModal(false)
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                          language === lang.code
                            ? 'bg-primary text-white'
                            : 'bg-surface text-white hover:bg-surface-light'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="font-medium">{lang.nativeName}</span>
                        </div>
                        {language === lang.code && <Check size={20} />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowLanguageModal(false)}
                    className="w-full mt-4 py-3 bg-surface text-gray-400 rounded-xl font-medium hover:bg-surface-light transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Theme Modal */}
      <AnimatePresence>
        {showThemeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[10000]"
              onClick={() => setShowThemeModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[10001] flex justify-center safe-area-bottom"
            >
              <div className="w-full max-w-md mx-4">
                <div className="bg-accent rounded-t-3xl p-6 border border-surface-light shadow-2xl">
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
                  
                  <h2 className="text-xl font-bold text-white mb-4">{t('settings.theme')}</h2>
                  
                  <div className="space-y-2">
                    {themes.map((th) => {
                      const ThemeIcon = th.icon
                      return (
                        <button
                          key={th.value}
                          onClick={() => {
                            dispatch(setTheme(th.value))
                            setShowThemeModal(false)
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            theme === th.value
                              ? 'bg-primary text-white'
                              : 'bg-surface text-white hover:bg-surface-light'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ThemeIcon size={20} />
                            <span className="font-medium">{th.label}</span>
                          </div>
                          {theme === th.value && <Check size={20} />}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setShowThemeModal(false)}
                    className="w-full mt-4 py-3 bg-surface text-gray-400 rounded-xl font-medium hover:bg-surface-light transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Settings
