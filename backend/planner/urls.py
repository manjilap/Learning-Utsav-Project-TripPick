from django.urls import path
from .views import GenerateItineraryView, SaveItineraryView, UserItinerariesView, ApproveItineraryView, DeleteItineraryView

urlpatterns = [
    path('generate/', GenerateItineraryView.as_view(), name='planner-generate'),
    path('save/', SaveItineraryView.as_view(), name='planner-save'),
    path('history/', UserItinerariesView.as_view(), name='planner-history'),
    
    # NEW HiTL Route:
    path('approve/', ApproveItineraryView.as_view(), name='approve-itinerary'),
    path('delete/<int:itinerary_id>/', DeleteItineraryView.as_view(), name='delete-itinerary'),
]