<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
    {/* Save Button */}
    <button 
        onClick={handleSave} 
        disabled={isSaving || status !== 'GENERATED'}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white' }}
    >
        {isSaving ? 'Saving...' : 'Save Itinerary'}
    </button>
    
    {/* Finalize Button */}
    {status === 'GENERATED' && itineraryId && (
        <button 
            onClick={handleApprove} 
            disabled={isApproving}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white' }}
        >
            {isApproving ? 'Finalizing...' : 'Approve & Send Final Itinerary'}
        </button>
    )}
    
    {/* Final Status Message */}
    {status === 'APPROVED' && (
        <span style={{ 
            color: '#155724', 
            backgroundColor: '#d4edda', 
            padding: '10px', 
            borderRadius: '5px',
            fontWeight: 'bold' 
        }}>
            ✅ Final Itinerary Approved! Check your email for the 'Ready to Book' PDF.
        </span>
    )}
</div>