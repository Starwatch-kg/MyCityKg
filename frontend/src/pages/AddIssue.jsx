import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, MapPin, ChevronLeft, Image as ImageIcon, X, Map } from 'lucide-react'
import { addIssue } from '../store/slices/issuesSlice'
import { useTranslation } from '../i18n/useTranslation'

const AddIssue = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const anonymousMode = useSelector(state => state.app.anonymousMode)
  const userLocation = useSelector(state => state.app.userLocation)

  // Get location and type from navigation state (from map click)
  const mapLocation = location.state?.location
  const preselectedType = location.state?.type

  const [formData, setFormData] = useState({
    type: preselectedType || '',
    title: '',
    description: '',
    photos: [],
    location: mapLocation || null,
    address: mapLocation ? `${mapLocation.lat.toFixed(4)}, ${mapLocation.lng.toFixed(4)}` : '',
    anonymous: anonymousMode,
  })

  const [photoPreviews, setPhotoPreviews] = useState([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  const issueTypes = [
    { value: 'мусор', label: `🗑️ ${t('issues.types.trash')}`, emoji: '🗑️' },
    { value: 'освещение', label: `💡 ${t('issues.types.lighting')}`, emoji: '💡' },
    { value: 'дороги', label: `🛣️ ${t('issues.types.roads')}`, emoji: '🛣️' },
    { value: 'вода', label: `💧 ${t('issues.types.water')}`, emoji: '💧' },
    { value: 'запах', label: `👃 ${t('issues.types.smell')}`, emoji: '👃' },
    { value: 'другое', label: `📝 ${t('issues.types.other')}`, emoji: '📝' },
  ]

  // Функция для получения адреса из координат
  const getAddressFromCoords = async (lat, lng) => {
    setIsLoadingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
      )
      const data = await response.json()
      
      if (data.address) {
        const { city, town, village, suburb, road, house_number, county } = data.address
        const cityName = city || town || village || county || 'Бишкек'
        const district = suburb || ''
        const street = road ? `${road}${house_number ? ', ' + house_number : ''}` : ''
        
        const addressParts = [cityName, district, street].filter(Boolean)
        return addressParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      console.error('Ошибка геокодирования:', error)
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } finally {
      setIsLoadingAddress(false)
    }
  }

  useEffect(() => {
    // Если есть координаты с карты, получаем адрес
    if (mapLocation) {
      getAddressFromCoords(mapLocation.lat, mapLocation.lng).then(address => {
        setFormData(prev => ({ ...prev, address }))
      })
    }
  }, [mapLocation])

  useEffect(() => {
    // Only use userLocation if no location was passed from map
    if (!mapLocation && userLocation && !formData.location) {
      setFormData(prev => ({ ...prev, location: userLocation }))
    }
  }, [userLocation, formData.location, mapLocation])

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    const maxPhotos = 5
    
    if (formData.photos.length + files.length > maxPhotos) {
      alert(`Можно загрузить максимум ${maxPhotos} фото`)
      return
    }
    
    const newPhotos = [...formData.photos, ...files]
    setFormData({ ...formData, photos: newPhotos })
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    setFormData({ ...formData, photos: newPhotos })
    setPhotoPreviews(newPreviews)
  }

  const handleGetLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setFormData(prev => ({ ...prev, location }))
          
          // Получаем адрес из координат
          const address = await getAddressFromCoords(location.lat, location.lng)
          setFormData(prev => ({
            ...prev,
            address,
          }))
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsGettingLocation(false)
          alert('Не удалось получить местоположение')
        }
      )
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.type || !formData.title) {
      alert('Пожалуйста, заполните обязательные поля')
      return
    }

    if (!formData.location) {
      alert('Пожалуйста, укажите местоположение')
      return
    }

    dispatch(addIssue({
      ...formData,
      photo: photoPreview || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400',
    }))

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-accent/95 backdrop-blur-sm p-3 sm:p-4 sticky top-0 z-50 shadow-lg safe-area-top">
        <div className="flex items-center gap-2 sm:gap-3 max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface rounded-lg transition-all active:scale-95"
            aria-label="Назад"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white">{t('issues.addIssue')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto pb-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            {t('issues.type')} *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {issueTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 relative overflow-hidden group ${
                  formData.type === type.value
                    ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/30'
                    : 'bg-surface text-white hover:scale-105 hover:shadow-md border border-surface-light hover:border-primary/50'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-xl">{type.emoji}</span>
                  <span>{type.label.split(' ')[1]}</span>
                </div>
                {formData.type === type.value && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('issues.issueTitle')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('issues.titlePlaceholder')}
            className="w-full bg-surface text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('issues.photos')} (до 5 штук)
          </label>
          
          {/* Photo Grid */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Photo Button */}
          {formData.photos.length < 5 && (
            <label className="flex flex-col items-center justify-center h-32 bg-surface rounded-xl cursor-pointer hover:bg-surface-light transition-colors border-2 border-dashed border-surface-light">
              <Camera size={32} className="text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">
                {formData.photos.length === 0 ? t('issues.addPhoto') : `${t('issues.addMore')} (${formData.photos.length}/5)`}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('issues.location')} *
          </label>
          
          {/* Manual Address Input */}
          <div className="relative mb-2">
            <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('issues.locationPlaceholder')}
              className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-surface-light focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation || isLoadingAddress}
              className="bg-surface text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-light transition-colors disabled:opacity-50"
            >
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">
                {isGettingLocation || isLoadingAddress ? t('issues.determining') : t('issues.myGeolocation')}
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/map', { state: { selectLocation: true, returnTo: '/add' } })}
              className="bg-primary text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
            >
              <Map size={18} />
              <span className="text-sm">{t('issues.selectOnMap')}</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('issues.description')} ({t('optional')})
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('issues.descriptionPlaceholder')}
            rows={4}
            className="w-full bg-surface text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Anonymous */}
        <div className="flex items-center justify-between bg-surface p-4 rounded-xl">
          <span className="text-white font-medium">{t('issues.submitAnonymously')}</span>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, anonymous: !formData.anonymous })}
            className={`w-12 h-6 rounded-full transition-colors ${
              formData.anonymous ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                formData.anonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          {t('issues.submit')}
        </button>
      </form>
    </div>
  )
}

export default AddIssue
