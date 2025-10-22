import { useSelector } from 'react-redux'
import { translations } from './translations'

export const useTranslation = () => {
  const language = useSelector(state => state.app.language)
  
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  return { t, language }
}
