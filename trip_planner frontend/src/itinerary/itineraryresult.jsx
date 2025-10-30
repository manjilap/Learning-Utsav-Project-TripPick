import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plane, Hotel, Calendar, DollarSign, MapPin, Clock, Users, Utensils, Package, Leaf, CheckCircle2, Sparkles } from 'lucide-react'
import api from '@/service/aimodel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ItineraryResult() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [itinerary, setItinerary] = useState(state?.itinerary || null)
    const [isSaving, setIsSaving] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [error, setError] = useState(null)
    const [itineraryId, setItineraryId] = useState(state?.itineraryId || null)
    const [status, setStatus] = useState(state?.savedStatus || 'GENERATED')
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        // If no itinerary provided via navigation state, redirect back to create trip
        if (!itinerary) {
            navigate('/createtrip')
        }
    }, [itinerary, navigate])

    const handleSave = async () => {
        if (!itinerary) return
        setError(null)
        setIsSaving(true)
        try {
            // Extract preferences from itinerary metadata
            const meta = itinerary.meta || {}
            const preferences = {
                destination: meta.destination || 'Unknown',
                origin: meta.origin || 'Unknown',
                Days: meta.days || 0,
                budget: meta.budget || 'Unknown',
                travelWith: meta.travelWith || 'Unknown'
            }
            
            const result = await api.saveItinerary({ 
                preferences, 
                itinerary 
            })
            // server may return saved id
            setItineraryId(result.id || result.itinerary_id || null)
            setStatus('SAVED')
        } catch (err) {
            console.error(err)
            setError(err.message || String(err))
        } finally {
            setIsSaving(false)
        }
    }

    const handleApprove = async () => {
        if (!itineraryId) {
            setError('Please save the itinerary before approving')
            return
        }
        setIsApproving(true)
        setError(null)
        try {
            await api.approveItinerary(itineraryId)
            setStatus('APPROVED')
        } catch (err) {
            console.error(err)
            setError(err.message || String(err))
        } finally {
            setIsApproving(false)
        }
    }

    // Helper function to parse ISO 8601 duration (e.g., PT25H45M)
    const parseDuration = (duration) => {
        if (!duration) return 'N/A'
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
        if (!match) return duration
        const hours = match[1] || '0'
        const minutes = match[2] || '0'
        return `${hours}h ${minutes}m`
    }

    // Helper function to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!itinerary) return null

    const meta = itinerary.meta || {}
    const flights = itinerary.flights || []
    const hotels = itinerary.hotels || []
    const activities = itinerary.activities || []
    const dayPlan = itinerary.day_plan || []
    const packingList = itinerary.packing_list || []
    const foodCulture = itinerary.food_culture || {}
    const co2Kg = itinerary.co2_kg || 0
    const weatherForecast = itinerary.weather?.forecast || []

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <h1 className='text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                                <Sparkles className='w-8 h-8 text-yellow-500' />
                                Your Dream Itinerary
                            </h1>
                            <p className='text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2'>
                                <MapPin className='w-4 h-4' />
                                {meta.destination} • {meta.days} Days • {meta.budget} Budget
                            </p>
                        </div>
                        <Badge variant="success" className='text-sm px-4 py-2'>
                            <CheckCircle2 className='w-4 h-4 mr-1' />
                            Generated
                        </Badge>
                    </div>

                    {error && (
                        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4'>
                            {error}
                        </div>
                    )}

                    {status === 'APPROVED' && (
                        <div className='bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2'>
                            <CheckCircle2 className='w-5 h-5' />
                            <span className='font-semibold'>Final Itinerary Approved! Check your email for the 'Ready to Book' PDF.</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 mb-8'>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || status !== 'GENERATED'}
                        variant="default"
                        size="lg"
                    >
                        {isSaving ? 'Saving...' : 'Save Itinerary'}
                    </Button>

                    {itineraryId && status === 'SAVED' && (
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving}
                            variant="default"
                            size="lg"
                            className='bg-green-600 hover:bg-green-700'
                        >
                            {isApproving ? 'Finalizing...' : 'Approve & Send Final Itinerary'}
                        </Button>
                    )}
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-7 mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="flights">Flights</TabsTrigger>
                        <TabsTrigger value="hotels">Hotels</TabsTrigger>
                        <TabsTrigger value="weather">Weather</TabsTrigger>
                        <TabsTrigger value="itinerary">Day Plan</TabsTrigger>
                        <TabsTrigger value="culture">Culture</TabsTrigger>
                        <TabsTrigger value="packing">Packing</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                        Flight Options
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{flights.length}</div>
                                    <p className="text-sm text-gray-600">Available flights</p>
                                    {flights.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-semibold">Best Price</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                ${Math.min(...flights.map(f => f.price)).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Hotel className="w-5 h-5 text-purple-600" />
                                        Accommodations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">{hotels.length}</div>
                                    <p className="text-sm text-gray-600">Hotel options</p>
                                    {hotels.length > 0 && hotels[0].price_per_night && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-semibold">From</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                ${hotels[0].price_per_night}/night
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-cyan-600" />
                                        Weather
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {weatherForecast.length > 0 ? (
                                        <>
                                            <div className="text-3xl font-bold text-cyan-600">{weatherForecast.length}</div>
                                            <p className="text-sm text-gray-600">Days forecasted</p>
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-sm font-semibold">Today's High</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {weatherForecast[0]?.max_temp_c}°C
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-gray-400">N/A</div>
                                            <p className="text-sm text-gray-600">No forecast</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                        Carbon Footprint
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{co2Kg}</div>
                                    <p className="text-sm text-gray-600">kg CO₂</p>
                                    <p className="text-xs text-gray-500 mt-2">Estimated for this trip</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Activities Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Activities Planned
                                </CardTitle>
                                <CardDescription>
                                    {activities.length} exciting activities across {meta.days} days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activities.slice(0, 6).map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{activity}</p>
                                        </div>
                                    ))}
                                </div>
                                {activities.length > 6 && (
                                    <p className="text-sm text-gray-500 mt-4 text-center">
                                        +{activities.length - 6} more activities. View the full itinerary in the Day Plan tab.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Flights Tab */}
                    <TabsContent value="flights" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plane className="w-6 h-6 text-blue-600" />
                                    Available Flights
                                </CardTitle>
                                <CardDescription>
                                    {flights.length} flight options from {flights[0]?.origin} to {flights[0]?.destination}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {flights.map((flight, idx) => (
                                    <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    Airline: {flight.airline}
                                                    <Badge variant={flight.stops === 0 ? 'success' : 'secondary'}>
                                                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                                    </Badge>
                                                </h3>
                                                <p className="text-sm text-gray-600">Flight #{flight.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-blue-600">${flight.price}</p>
                                                <p className="text-sm text-gray-600">{flight.currency}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Outbound */}
                                            <div className="space-y-2">
                                                <p className="font-semibold text-sm text-gray-600">Outbound</p>
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-2xl font-bold">{flight.origin}</p>
                                                        <p className="text-sm text-gray-600">{formatDate(flight.departure_time)}</p>
                                                    </div>
                                                    <div className="flex-1 flex items-center">
                                                        <div className="h-px bg-gray-300 flex-1"></div>
                                                        <Plane className="w-4 h-4 text-gray-400 mx-2" />
                                                        <div className="h-px bg-gray-300 flex-1"></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold">{flight.destination}</p>
                                                        <p className="text-sm text-gray-600">{formatDate(flight.arrival_time)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    Duration: {parseDuration(flight.duration)}
                                                </div>
                                            </div>

                                            {/* Return */}
                                            {flight.return_departure && (
                                                <div className="space-y-2 border-l pl-6">
                                                    <p className="font-semibold text-sm text-gray-600">Return</p>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="text-2xl font-bold">{flight.destination}</p>
                                                            <p className="text-sm text-gray-600">{formatDate(flight.return_departure)}</p>
                                                        </div>
                                                        <div className="flex-1 flex items-center">
                                                            <div className="h-px bg-gray-300 flex-1"></div>
                                                            <Plane className="w-4 h-4 text-gray-400 mx-2 rotate-180" />
                                                            <div className="h-px bg-gray-300 flex-1"></div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold">{flight.origin}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        Duration: {parseDuration(flight.return_duration)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Hotels Tab */}
                    <TabsContent value="hotels" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hotel className="w-6 h-6 text-purple-600" />
                                    Recommended Hotels
                                </CardTitle>
                                <CardDescription>
                                    {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} near {meta.destination}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hotels.map((hotel, idx) => (
                                    <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold">{hotel.name}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {hotel.address?.city || hotel.address}
                                                </p>
                                                {hotel.distance && (
                                                    <p className="text-sm text-gray-500 mt-1">📍 {hotel.distance} from city center</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {hotel.price_per_night && (
                                                    <>
                                                        <p className="text-2xl font-bold text-purple-600">${hotel.price_per_night}</p>
                                                        <p className="text-sm text-gray-600">per night</p>
                                                    </>
                                                )}
                                                {hotel.rating && hotel.rating !== 'N/A' && (
                                                    <p className="text-sm mt-2">⭐ {hotel.rating}</p>
                                                )}
                                            </div>
                                        </div>

                                        {hotel.amenities && hotel.amenities.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold mb-2">Amenities:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {hotel.amenities.map((amenity, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {amenity}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {hotel.chain_code && (
                                            <p className="text-xs text-gray-500 mt-3">Chain: {hotel.chain_code} • ID: {hotel.id}</p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Weather Tab */}
                    <TabsContent value="weather" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-cyan-600" />
                                    Weather Forecast
                                </CardTitle>
                                <CardDescription>
                                    {weatherForecast.length > 0 ? `${weatherForecast.length}-day weather forecast for ${meta.destination}` : 'Weather information unavailable'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {weatherForecast.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {weatherForecast.map((day, idx) => (
                                            <div key={idx} className="border rounded-lg p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-2xl">
                                                        {day.summary?.toLowerCase().includes('rain') ? '🌧️' : 
                                                         day.summary?.toLowerCase().includes('cloud') ? '☁️' :
                                                         day.summary?.toLowerCase().includes('clear') ? '☀️' :
                                                         day.summary?.toLowerCase().includes('snow') ? '❄️' : '🌤️'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
                                                        <span className="text-lg font-bold text-red-600">{day.max_temp_c}°C</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
                                                        <span className="text-lg font-bold text-blue-600">{day.min_temp_c}°C</span>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{day.summary}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Weather forecast not available for this destination.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Day Plan Tab */}
                    <TabsContent value="itinerary" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-orange-600" />
                                    Daily Itinerary
                                </CardTitle>
                                <CardDescription>
                                    Your {meta.days}-day adventure plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {dayPlan.map((day, idx) => (
                                    <div key={idx} className="border-l-4 border-orange-500 pl-6 py-4">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                                {day.day}
                                            </span>
                                            Day {day.day}
                                        </h3>
                                        <div className="space-y-3">
                                            {day.activities.map((activity, actIdx) => (
                                                <div key={actIdx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-gray-700 dark:text-gray-300">{activity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Culture Tab */}
                    <TabsContent value="culture" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Utensils className="w-6 h-6 text-red-600" />
                                        Cuisine & Food
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {foodCulture.cuisine_summary || 'No cuisine information available.'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                        Cultural Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {foodCulture.cultural_note || 'No cultural information available.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Packing Tab */}
                    <TabsContent value="packing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-6 h-6 text-teal-600" />
                                    Packing List
                                </CardTitle>
                                <CardDescription>
                                    Essential items for your trip
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {packingList.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
                                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}