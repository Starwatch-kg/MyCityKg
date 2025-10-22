import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { Filter, Navigation, Trash2, Lightbulb, Construction, Droplet, Wind, FileText, ChevronLeft } from 'lucide-react'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { setUserLocation } from '../store/slices/appSlice'
import FilterModal from '../components/FilterModal'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons with SVG icons
const createCustomIcon = (color, type) => {
  const typeIcons = {
    'мусор': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    'освещение': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    'дороги': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4"/><path d="M18 12h4"/><path d="M12 2v4"/><path d="M12 18v4"/><circle cx="12" cy="12" r="4"/></svg>',
    'вода': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    'запах': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m15 5-3 3-3-3"/><path d="m19 9-3 3-3-3"/><path d="m5 9 3 3 3-3"/></svg>',
    'другое': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
  }
  
  const icon = typeIcons[type] || typeIcons['другое']
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: ${color};
          border: 3px solid #1E1E1E;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 4px ${color}20;
          animation: pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">${icon}</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

const statusColors = {
  'новое': '#FFD43B',
  'в работе': '#FF9800',
  'решено': '#4CAF50',
}

const LocationMarker = () => {
  const dispatch = useDispatch()
  const map = useMap()
  const [position, setPosition] = useState(null)

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setPosition(e.latlng)
      dispatch(setUserLocation(e.latlng))
      map.flyTo(e.latlng, 13)
    })
  }, [map, dispatch])

  return position === null ? null : (
    <Marker
      position={position}
      icon={L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #2196F3;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })}
    >
      <Popup>Вы здесь</Popup>
    </Marker>
  )
}

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const CityMap = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const issues = useSelector(state => state.issues.issues)
  const filters = useSelector(state => state.issues.filters)
  const [showFilters, setShowFilters] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [center] = useState([42.8746, 74.5698]) // Bishkek coordinates
  
  // Check if we're in location selection mode
  const selectLocationMode = location.state?.selectLocation
  const returnTo = location.state?.returnTo

  const issueTypes = [
    { value: 'мусор', label: 'Мусор', icon: Trash2, color: '#FFD43B' },
    { value: 'освещение', label: 'Освещение', icon: Lightbulb, color: '#FF9800' },
    { value: 'дороги', label: 'Дороги', icon: Construction, color: '#FFD43B' },
    { value: 'вода', label: 'Вода', icon: Droplet, color: '#2196F3' },
    { value: 'запах', label: 'Запах', icon: Wind, color: '#9C27B0' },
    { value: 'другое', label: 'Другое', icon: FileText, color: '#607D8B' },
  ]

  const filteredIssues = issues.filter(issue => {
    if (filters.type && issue.type !== filters.type) return false
    if (filters.status && issue.status !== filters.status) return false
    return true
  })

  const handleMarkerClick = (issue) => {
    navigate(`/issue/${issue.id}`)
  }

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng)
    
    // If in selection mode, return to AddIssue with location
    if (selectLocationMode) {
      navigate(returnTo || '/add', { 
        state: { 
          location: latlng
        } 
      })
    } else {
      setShowTypeMenu(true)
    }
  }

  const handleTypeSelect = (type) => {
    // Navigate to add issue page with location and type
    navigate('/add', { 
      state: { 
        location: selectedLocation,
        type: type
      } 
    })
    setShowTypeMenu(false)
    setSelectedLocation(null)
  }

  return (
    <div className="relative h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-background via-background/80 to-transparent p-3 sm:p-4 lg:p-6 safe-area-top">
        <div className="flex items-center justify-between px-4 lg:px-8">
          {selectLocationMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(returnTo || '/add')}
                className="bg-accent/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl hover:bg-surface transition-all active:scale-95 shadow-lg"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">Выберите место на карте</h1>
                <p className="text-xs sm:text-sm text-gray-400">Нажмите на карту чтобы выбрать локацию</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">MyCityKg</h1>
              <button
                onClick={() => setShowFilters(true)}
                className="bg-accent/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl hover:bg-surface transition-all active:scale-95 shadow-lg"
                aria-label="Открыть фильтры"
              >
                <Filter size={20} className="text-primary" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        <LocationMarker />

        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
            icon={createCustomIcon(statusColors[issue.status], issue.type)}
            eventHandlers={{
              click: () => handleMarkerClick(issue),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-white mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{issue.address}</p>
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${statusColors[issue.status]}20`,
                    color: statusColors[issue.status],
                  }}
                >
                  {issue.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Locate Me Button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                // Map will be updated through LocationMarker component
              },
              (error) => {
                console.error('Error getting location:', error)
              }
            )
          }
        }}
        className="absolute bottom-20 sm:bottom-24 right-3 sm:right-4 z-[1000] bg-accent/90 backdrop-blur-sm p-3 sm:p-4 rounded-full shadow-2xl hover:bg-surface transition-all active:scale-95"
        aria-label="Найти меня на карте"
      >
        <Navigation size={22} className="text-primary" />
      </button>

      {/* Filter Modal */}
      <FilterModal isOpen={showFilters} onClose={() => setShowFilters(false)} />

      {/* Type Selection Menu */}
      <AnimatePresence>
      {showTypeMenu && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[10000]"
            onClick={() => {
              setShowTypeMenu(false)
              setSelectedLocation(null)
            }}
          />

          {/* Menu */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[10001] bg-accent rounded-t-3xl p-4 sm:p-6 safe-area-bottom shadow-2xl"
          >
            <div className="max-w-2xl mx-auto">
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              
              <h2 className="text-xl font-bold text-white mb-2 text-center">
                Что здесь произошло?
              </h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Выберите тип проблемы
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {issueTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <motion.button
                      key={type.value}
                      onClick={() => handleTypeSelect(type.value)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="bg-gradient-to-br from-surface to-surface-light p-4 rounded-2xl border border-surface-light hover:border-primary/50 hover:shadow-lg transition-all group"
                    >
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ 
                          background: `linear-gradient(135deg, ${type.color}40, ${type.color}20)`,
                          boxShadow: `0 4px 12px ${type.color}30`
                        }}
                      >
                        <Icon size={24} style={{ color: type.color }} />
                      </div>
                      <p className="text-sm font-medium text-white text-center">
                        {type.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={() => {
                  setShowTypeMenu(false)
                  setSelectedLocation(null)
                }}
                className="w-full py-3 bg-surface text-gray-400 rounded-xl font-medium hover:bg-surface-light transition-colors"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  )
}

export default CityMap
