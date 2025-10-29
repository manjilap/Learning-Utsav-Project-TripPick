const API_BASE = import.meta.env.VITE_API_BASE;



// Add the new save function
const saveItinerary = async (payload) => {
    const response = await fetch(`${API_BASE}/api/planner/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Save Itinerary failed.');
    }
    return response.json();
};

// Add the new approve function for HiTL
const approveItinerary = async (itineraryId) => {
    // NOTE: This assumes authentication is handled via global context or local storage 
    // for the JWT token, which should be added to the 'Authorization' header.
    // For now, we omit the auth header for speed, but add a TODO.
    
    const response = await fetch(`${API_BASE}/api/planner/approve/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // TODO: Add 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ itinerary_id: itineraryId, new_status: 'APPROVED' }),
    });

    if (!response.ok) {
        throw new Error('Approve Itinerary failed.');
    }
    return response.json();
};
const getItineraryHistory = async (userId) => {

    const response = await fetch(`${API_BASE}/api/planner/history/${userId}/`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            // TODO: Add Authorization header here for production
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch itinerary history.');
    }
    return response.json();
};

export default {
    // ... (generateItinerary),
    saveItinerary,
    approveItinerary,
    getItineraryHistory,
};

