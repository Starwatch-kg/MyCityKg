import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Leaf, User, Bell, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useTranslation } from '../i18n/useTranslation'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const notifications = useSelector(state => state.notifications.items)
  const unreadCount = notifications.filter(n => !n.read).length

  const tabs = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/add', icon: PlusCircle, label: t('nav.add') },
    { path: '/ecology', icon: Leaf, label: t('nav.ecology') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Left */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-accent border-r border-surface-light flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-surface-light">
          <h1 className="text-2xl font-bold text-primary">
            MyCityKg
          </h1>
          <p className="text-xs text-gray-400 mt-1">{t('appTagline')}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.path)
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
                  active 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-gray-400 hover:bg-surface hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className={`font-medium ${active ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-surface-light space-y-2">
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-surface hover:text-white transition-all relative"
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="font-medium">{t('nav.notifications')}</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-surface hover:text-white transition-all"
          >
            <Settings size={20} />
            <span className="font-medium">{t('nav.settings')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pb-20 lg:pb-0">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-accent/95 backdrop-blur-md border-t border-surface-light z-[9999] shadow-2xl safe-area-bottom">
        <div className="px-2 sm:px-4">
          <div className="flex justify-around items-center h-16 sm:h-20">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = isActive(tab.path)
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center flex-1 h-full transition-all hover:bg-surface/30 active:scale-95 touch-manipulation"
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-b-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={window.innerWidth < 640 ? 22 : 24}
                    className={`mb-1 transition-colors ${
                      active ? 'text-primary' : 'text-gray-400'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className={`text-[10px] sm:text-xs transition-colors leading-tight ${
                      active ? 'text-primary font-semibold' : 'text-gray-400 font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout
