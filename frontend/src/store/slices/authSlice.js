import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
}

// Проверяем localStorage при загрузке
const savedUser = localStorage.getItem('user')
if (savedUser) {
  try {
    initialState.user = JSON.parse(savedUser)
    initialState.isAuthenticated = true
  } catch (e) {
    console.error('Error parsing saved user:', e)
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
    },
  },
})

export const { setUser, updateUser, logout } = authSlice.actions
export default authSlice.reducer
