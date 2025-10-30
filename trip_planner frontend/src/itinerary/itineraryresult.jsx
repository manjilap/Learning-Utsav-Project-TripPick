import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '@/service/aimodel'

export default function ItineraryResult() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [itinerary, setItinerary] = useState(state?.itinerary || null)
    const [isSaving, setIsSaving] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [error, setError] = useState(null)
    const [itineraryId, setItineraryId] = useState(null)
    const [status, setStatus] = useState('GENERATED')

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
            const result = await api.saveItinerary({ itinerary })
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

    if (!itinerary) return null

    return (
        <div className='max-w-4xl mx-auto mt-16 px-4 sm:px-8 lg:px-16'>
            <h2 className='text-2xl font-bold mb-4'>Your Itinerary</h2>
            {error && <div className='text-red-600 mb-4'>{error}</div>}

            <div className='bg-white shadow rounded-lg p-6'>
                {/* render a simple summary */}
                <div className='mb-4'>
                    <strong>Destination:</strong> {itinerary.destination || itinerary.meta?.destination}
                </div>
                <div className='mb-4'>
                    <strong>Days:</strong> {itinerary.days || itinerary.meta?.days}
                </div>

                {/* Controls */}
                <div className='flex items-center justify-between mt-6'>
                    <div />
                    <div className='flex gap-3'>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || status !== 'GENERATED'}
                            className='px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50'
                        >
                            {isSaving ? 'Saving...' : 'Save Itinerary'}
                        </button>

                        {status === 'GENERATED' && itineraryId && (
                            <button
                                onClick={handleApprove}
                                disabled={isApproving}
                                className='px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50'
                            >
                                {isApproving ? 'Finalizing...' : 'Approve & Send Final Itinerary'}
                            </button>
                        )}

                        {status === 'APPROVED' && (
                            <span className='px-3 py-2 rounded bg-green-50 text-green-800 font-semibold'>
                                ✅ Final Itinerary Approved! Check your email for the 'Ready to Book' PDF.
                            </span>
                        )}
                    </div>
                </div>

                {/* Raw itinerary JSON preview for now */}
                <pre className='mt-6 overflow-auto text-sm bg-gray-50 p-4 rounded'>
                    {JSON.stringify(itinerary, null, 2)}
                </pre>
            </div>
        </div>
    )
}