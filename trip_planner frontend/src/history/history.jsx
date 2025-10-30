// In trip_planner frontend/src/history/History.jsx

import React, { useState, useEffect } from 'react';
import itineraryService from '../service/aimodel.jsx';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, DollarSign, Trash2, Eye, MapPin } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await itineraryService.getItineraryHistory();
                setHistory(data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Could not load trip history. Please make sure you're logged in.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleViewDetails = (item) => {
        // Navigate to the ItineraryResult page, passing the itinerary data
        // The item structure from backend has: { id, user, preferences, itinerary, status, created_at }
        // We need to pass just the itinerary object
        navigate('/itinerary', { state: { itinerary: item.itinerary, itineraryId: item.id, savedStatus: item.status } });
    };

    const handleDelete = async (itineraryId, destination) => {
        // Confirm before deleting
        if (!window.confirm(`Are you sure you want to delete the trip to ${destination}?`)) {
            return;
        }

        setDeletingId(itineraryId);
        setError(null);

        try {
            await itineraryService.deleteItinerary(itineraryId);
            // Remove the deleted item from the list
            setHistory(prevHistory => prevHistory.filter(item => item.id !== itineraryId));
        } catch (err) {
            console.error("Error deleting itinerary:", err);
            setError(err.message || "Failed to delete itinerary. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading your trips...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                        <Plane className="w-10 h-10 text-blue-600" />
                        My Travel Itineraries
                    </h1>
                    <p className="text-gray-600 text-lg">
                        You have {history.length} saved {history.length === 1 ? 'trip' : 'trips'}
                    </p>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">✈️</div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No trips yet!</h3>
                            <p className="text-gray-600 mb-6">Start planning your next adventure</p>
                            <button 
                                onClick={() => navigate('/createtrip')}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Plan a Trip
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => {
                            // Try to get destination from preferences or itinerary metadata
                            const destination = item.preferences?.destination || 
                                              item.itinerary?.meta?.destination || 
                                              'Unknown Destination'
                            const days = item.preferences?.Days || 
                                        item.itinerary?.meta?.days || 
                                        'N/A'
                            const budget = item.preferences?.budget || 
                                          item.itinerary?.meta?.budget || 
                                          'N/A'
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Card Header with Gradient */}
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <MapPin className="w-5 h-5" />
                                                {destination}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                item.status === 'APPROVED' 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-yellow-400 text-gray-900'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm opacity-90">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {days} Days
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                {budget}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6">
                                        <p className="text-gray-500 text-sm mb-4">
                                            Planned on {new Date(item.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => handleViewDetails(item)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id, destination)}
                                                disabled={deletingId === item.id}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                                                    deletingId === item.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                }`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deletingId === item.id ? 'Deleting...' : ''}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;