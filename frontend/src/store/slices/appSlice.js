import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hasCompletedOnboarding: localStorage.getItem('hasCompletedOnboarding') === 'true',
  language: localStorage.getItem('language') || 'ru',
  theme: localStorage.getItem('theme') || 'dark',
  notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
  anonymousMode: localStorage.getItem('anonymousMode') === 'true',
  userLocation: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true
      localStorage.setItem('hasCompletedOnboarding', 'true')
    },
    setLanguage: (state, action) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled
      localStorage.setItem('notificationsEnabled', state.notificationsEnabled)
    },
    toggleAnonymousMode: (state) => {
      state.anonymousMode = !state.anonymousMode
      localStorage.setItem('anonymousMode', state.anonymousMode)
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload
    },
  },
})

export const {
  completeOnboarding,
  setLanguage,
  setTheme,
  toggleNotifications,
  toggleAnonymousMode,
  setUserLocation,
} = appSlice.actions

export default appSlice.reducer
