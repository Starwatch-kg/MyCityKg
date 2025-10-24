import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

// Async thunks for API calls
export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (params = {}) => {
    const response = await apiService.getReports(params)
    return response.data || response
  }
)

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData) => {
    const response = await apiService.createReport(issueData)
    return response.data || response
  }
)

const initialState = {
  issues: [],
  filters: {
    type: null,
    district: null,
    status: null,
  },
  selectedIssue: null,
  loading: false,
  error: null,
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
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch issues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false
        // API возвращает объект с полем reports, извлекаем массив
        state.issues = action.payload.reports || action.payload || []
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Create issue
      .addCase(createIssue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.loading = false
        state.issues.unshift(action.payload)
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const {
  addIssue,
  updateIssueStatus,
  setFilter,
  clearFilters,
  selectIssue,
  likeIssue,
  setLoading,
  setError,
} = issuesSlice.actions

export default issuesSlice.reducer
