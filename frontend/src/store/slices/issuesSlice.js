import { createSlice } from '@reduxjs/toolkit'

// Mock data removed - no fake markers on map
const mockIssues = []

const initialState = {
  issues: mockIssues,
  filters: {
    type: null,
    district: null,
    status: null,
  },
  selectedIssue: null,
}

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    addIssue: (state, action) => {
      state.issues.unshift({
        ...action.payload,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'новое',
        reactions: { likes: 0, comments: 0 },
      })
    },
    updateIssueStatus: (state, action) => {
      const issue = state.issues.find(i => i.id === action.payload.id)
      if (issue) {
        issue.status = action.payload.status
      }
    },
    setFilter: (state, action) => {
      state.filters[action.payload.type] = action.payload.value
    },
    clearFilters: (state) => {
      state.filters = { type: null, district: null, status: null }
    },
    selectIssue: (state, action) => {
      state.selectedIssue = action.payload
    },
    likeIssue: (state, action) => {
      const issue = state.issues.find(i => i.id === action.payload)
      if (issue) {
        issue.reactions.likes += 1
      }
    },
  },
})

export const {
  addIssue,
  updateIssueStatus,
  setFilter,
  clearFilters,
  selectIssue,
  likeIssue,
} = issuesSlice.actions

export default issuesSlice.reducer
