import api from '@/service/api'

async function handleAxiosResponse(promise) {
  try {
    const resp = await promise
    return resp.data
  } catch (err) {
    // normalize error message
    const serverData = err?.response?.data
    const message = serverData?.detail || serverData?.message || serverData || err.message || 'Request failed'
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }
}

export async function generateItinerary(prefs) {
  // Backend expects preferences wrapped in a 'preferences' key
  return handleAxiosResponse(api.post('/api/planner/generate/', { preferences: prefs }))
}

export async function saveItinerary(payload) {
  return handleAxiosResponse(api.post('/api/planner/save/', payload))
}

export async function approveItinerary(itineraryId) {
  return handleAxiosResponse(api.post('/api/planner/approve/', { itinerary_id: itineraryId, new_status: 'APPROVED' }))
}

export async function getItineraryHistory(userId) {
  return handleAxiosResponse(api.get(`/api/planner/history/${userId}/`))
}

export default {
  generateItinerary,
  saveItinerary,
  approveItinerary,
  getItineraryHistory,
}

