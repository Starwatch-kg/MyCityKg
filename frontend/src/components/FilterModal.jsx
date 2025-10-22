import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { setFilter, clearFilters } from '../store/slices/issuesSlice'
import { useTranslation } from '../i18n/useTranslation'

const FilterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const filters = useSelector(state => state.issues.filters)

  const issueTypes = [
    { value: 'мусор', label: t('issues.types.trash') },
    { value: 'освещение', label: t('issues.types.lighting') },
    { value: 'дороги', label: t('issues.types.roads') },
    { value: 'вода', label: t('issues.types.water') },
    { value: 'запах', label: t('issues.types.smell') },
    { value: 'другое', label: t('issues.types.other') },
  ]

  const statuses = [
    { value: 'новое', label: t('issues.statuses.new') },
    { value: 'в работе', label: t('issues.statuses.inProgress') },
    { value: 'решено', label: t('issues.statuses.resolved') },
  ]

  const handleFilterChange = (type, value) => {
    dispatch(setFilter({ type, value: filters[type] === value ? null : value }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[2000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-accent rounded-t-3xl z-[10000] max-h-[85vh] overflow-y-auto safe-area-bottom"
          >
            <div className="p-4 sm:p-6 pb-safe">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">{t('issues.filters')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Type Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">{t('issues.type')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {issueTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleFilterChange('type', type.value)}
                      className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm sm:text-base font-medium transition-all active:scale-95 ${
                        filters.type === type.value
                          ? 'bg-primary text-accent'
                          : 'bg-surface text-white hover:bg-surface-light'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">{t('issues.status')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleFilterChange('status', status.value)}
                      className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-base font-medium transition-all active:scale-95 ${
                        filters.status === status.value
                          ? 'bg-primary text-accent'
                          : 'bg-surface text-white hover:bg-surface-light'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 sm:py-3.5 bg-surface text-white rounded-xl text-sm sm:text-base font-medium hover:bg-surface-light transition-all active:scale-95"
                >
                  {t('issues.resetFilters')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 sm:py-3.5 bg-primary text-accent rounded-xl text-sm sm:text-base font-medium hover:bg-yellow-400 transition-all active:scale-95"
                >
                  {t('issues.applyFilters')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterModal
