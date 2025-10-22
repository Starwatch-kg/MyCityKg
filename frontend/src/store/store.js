import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import issuesReducer from './slices/issuesSlice'
import authReducer from './slices/authSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    issues: issuesReducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
})
