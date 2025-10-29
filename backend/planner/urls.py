from django.urls import path
from .views import GenerateItineraryView, SaveItineraryView, UserItinerariesView, ApproveItineraryView

urlpatterns = [
    path('generate/', GenerateItineraryView.as_view(), name='planner-generate'),
    path('save/', SaveItineraryView.as_view(), name='planner-save'),
    path('history/<str:user_id>/', UserItinerariesView.as_view(), name='planner-history'),
    
    # NEW HiTL Route:
    path('approve/', ApproveItineraryView.as_view(), name='approve-itinerary'),
]