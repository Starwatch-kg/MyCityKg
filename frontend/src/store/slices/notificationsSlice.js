import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      })
    },
    markNotificationRead: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsRead: (state) => {
      state.items.forEach(n => {
        n.read = true
      })
    },
    clearNotifications: (state) => {
      state.items = []
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(n => n.id !== action.payload)
    },
  },
})

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  removeNotification,
} = notificationsSlice.actions

export default notificationsSlice.reducer
