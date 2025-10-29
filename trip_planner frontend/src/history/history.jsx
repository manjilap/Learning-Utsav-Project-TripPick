// In trip_planner frontend/src/history/History.jsx

import React, { useState, useEffect } from 'react';
import itineraryService from '../service/aimodel.jsx';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // NOTE: Replace '1' with the actual logged-in user's ID or handle guest state.
        // Since auth is a skeleton, we use a placeholder ID of 1 to hit the endpoint.
        const PLACEHOLDER_USER_ID = 1; 

        const fetchHistory = async () => {
            try {
                const data = await itineraryService.getItineraryHistory(PLACEHOLDER_USER_ID);
                setHistory(data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Could not load trip history. Please ensure a user exists with ID 1.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleViewDetails = (itinerary) => {
        // Navigate to the ItineraryResult page, passing the full itinerary data
        navigate('/itinerary', { state: { itinerary: itinerary } });
    };

    if (isLoading) return <div style={{ textAlign: 'center' }}>Loading trip history...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2>My Past Trips & Saved Plans ({history.length})</h2>
            {history.length === 0 ? (
                <p>You haven't saved any trips yet. Start planning one!</p>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {history.map((item) => (
                        <div 
                            key={item.id} 
                            style={{ 
                                border: '1px solid #ddd', 
                                padding: '15px', 
                                borderRadius: '5px',
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <h3>{item.preferences.destination || 'Unknown Destination'}</h3>
                                <p>Status: <span style={{ fontWeight: 'bold', color: item.status === 'APPROVED' ? 'green' : '#ffc107' }}>{item.status}</span></p>
                                <p>Planned on: {new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={() => handleViewDetails(item)}
                                style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;