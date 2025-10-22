import { useState } from 'react'
import { Wind, Droplets, Sprout, AlertTriangle, Lightbulb, MapPin, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '../i18n/useTranslation'

const EcologyInfo = () => {
  const { t } = useTranslation()
  const [selectedTerritory, setSelectedTerritory] = useState('')
  const [showTerritoryMenu, setShowTerritoryMenu] = useState(false)

  const territories = [
    { id: 'bishkek-center', name: 'Бишкек, Центральный район' },
    { id: 'bishkek-lenin', name: 'Бишкек, Ленинский район' },
    { id: 'bishkek-pervomay', name: 'Бишкек, Первомайский район' },
    { id: 'bishkek-oktyabr', name: 'Бишкек, Октябрьский район' },
    { id: 'osh', name: 'Ош' },
    { id: 'jalal-abad', name: 'Джалал-Абад' },
    { id: 'karakol', name: 'Каракол' },
  ]

  const metrics = [
    {
      icon: Wind,
      label: t('ecology.airQuality'),
      value: 'N/A',
      score: 0,
      color: '#6B7280',
      description: t('ecology.noData'),
    },
    {
      icon: Droplets,
      label: t('ecology.waterQuality'),
      value: 'N/A',
      score: 0,
      color: '#6B7280',
      description: t('ecology.noData'),
    },
    {
      icon: Sprout,
      label: t('ecology.soilCondition'),
      value: 'N/A',
      score: 0,
      color: '#6B7280',
      description: t('ecology.noData'),
    },
  ]

  const warnings = []

  const tips = [
    'Используйте общественный транспорт',
    'Сортируйте мусор',
    'Экономьте воду и электричество',
    'Сажайте деревья',
    'Используйте многоразовые сумки',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 sticky top-0 z-50 shadow-lg safe-area-top">
        <div className="px-4 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">{t('ecology.districtEcology')}</h1>
          
          {/* Territory Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTerritoryMenu(!showTerritoryMenu)}
              className="w-full sm:w-auto bg-surface hover:bg-surface-light border border-surface-light rounded-xl px-4 py-3 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <span className="text-white text-sm">
                  {selectedTerritory 
                    ? territories.find(t => t.id === selectedTerritory)?.name 
                    : t('ecology.selectTerritory')}
                </span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-400 transition-transform ${
                  showTerritoryMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showTerritoryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 sm:w-auto sm:min-w-[300px] mt-2 bg-accent border border-surface-light rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {territories.map((territory) => (
                    <button
                      key={territory.id}
                      onClick={() => {
                        setSelectedTerritory(territory.id)
                        setShowTerritoryMenu(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-surface transition-colors ${
                        selectedTerritory === territory.id
                          ? 'bg-surface text-primary font-medium'
                          : 'text-gray-300'
                      }`}
                    >
                      {territory.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">
        {!selectedTerritory ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MapPin size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t('ecology.selectTerritory')}</h2>
            <p className="text-gray-400 mb-6">{t('ecology.selectTerritoryDesc')}</p>
            <button
              onClick={() => setShowTerritoryMenu(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 active:scale-95"
            >
              {t('ecology.selectTerritory')}
            </button>
          </motion.div>
        ) : (
          <>
        {/* Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-surface to-surface-light rounded-2xl p-3 sm:p-4 border border-surface-light hover:border-primary/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-3 rounded-xl bg-gradient-to-br shadow-lg"
                    style={{ 
                      backgroundImage: `linear-gradient(135deg, ${metric.color}40, ${metric.color}20)`,
                      boxShadow: `0 4px 12px ${metric.color}30`
                    }}
                  >
                    <Icon size={24} style={{ color: metric.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{metric.label}</h3>
                    <p className="text-sm text-gray-400 mb-2">{metric.description}</p>
                    
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gray-600" style={{ width: '0%' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        N/A
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* No Data Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-500 mb-1">
                {t('ecology.noData')}
              </h3>
              <p className="text-sm text-gray-300">
                {t('ecology.noDataMessage')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Предупреждения
            </h2>
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-orange-500 mb-1">
                    {warning.title}
                  </h3>
                  <p className="text-sm text-gray-300">{warning.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-primary" />
            Экологические советы
          </h2>
          <div className="bg-surface rounded-xl p-4 space-y-3">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
                <p className="text-gray-300">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-sm text-gray-300">
            <strong>Примечание:</strong> Для получения актуальных данных требуется подключение к API. 
            Все показатели отмечены как N/A до интеграции с источником данных.
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

export default EcologyInfo
