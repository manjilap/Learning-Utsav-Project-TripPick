from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # <--- NEW IMPORT
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMessage
from django.conf import settings

from .agents.orchestrator import orchestrate_itinerary
from .serializers import ItinerarySerializer
from .models import Itinerary, STATUS_CHOICES

import json
import logging
import threading  # <--- NEW IMPORT for Async

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------------------
# Email Sending Helpers (Synchronous & Asynchronous)
# ------------------------------------------------------------------------------

def _format_duration(duration_str):
    """Convert ISO 8601 duration (PT25H45M) to readable format."""
    if not duration_str or not duration_str.startswith('PT'):
        return duration_str
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', duration_str)
    if not match:
        return duration_str
    hours = match.group(1) or '0'
    minutes = match.group(2) or '0'
    return f"{hours}h {minutes}m"


def _generate_itinerary_html(prefs: dict, itinerary: dict) -> str:
    """Generate a beautiful HTML email for the itinerary."""
    meta = itinerary.get('meta', {})
    destination = meta.get('destination', prefs.get('destination', 'Your Destination'))
    days = meta.get('days', prefs.get('Days', 'N/A'))
    budget = meta.get('budget', prefs.get('budget', 'N/A'))
    
    flights = itinerary.get('flights', [])
    hotels = itinerary.get('hotels', [])
    activities = itinerary.get('activities', [])
    day_plan = itinerary.get('day_plan', [])
    packing_list = itinerary.get('packing_list', [])
    food_culture = itinerary.get('food_culture', {})
    
    # Build flights HTML
    flights_html = ""
    for flight in flights[:3]:  # Show top 3 flights
        flights_html += f"""
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>Airline: {flight.get('airline', 'N/A')}</strong>
                <strong style="color: #2563eb; font-size: 20px;">${flight.get('price', 'N/A')}</strong>
            </div>
            <div style="color: #6b7280; font-size: 14px;">
                <div>✈️ {flight.get('origin', '')} → {flight.get('destination', '')}</div>
                <div>⏱️ Duration: {_format_duration(flight.get('duration', 'N/A'))}</div>
                <div>🔄 Stops: {flight.get('stops', 'N/A')}</div>
                <div>📅 Departure: {flight.get('departure_time', 'N/A')}</div>
            </div>
        </div>
        """
    
    # Build hotels HTML
    hotels_html = ""
    for hotel in hotels[:5]:  # Show top 5 hotels
        # Handle address - it can be either a dict or a string
        address = hotel.get('address', {})
        if isinstance(address, dict):
            city = address.get('city', 'N/A')
            country = address.get('country', 'N/A')
            location = f"{city}, {country}"
        else:
            # address is a string
            location = str(address) if address else 'N/A'
        
        hotels_html += f"""
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
            <strong style="font-size: 16px;">{hotel.get('name', 'N/A')}</strong>
            <div style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                <div>📍 {location}</div>
                <div>📏 Distance: {hotel.get('distance', 'N/A')}</div>
            </div>
        </div>
        """
    
    # Build day plan HTML
    day_plan_html = ""
    for day in day_plan:
        activities_list = "".join([f"<li style='margin-bottom: 8px;'>{act}</li>" for act in day.get('activities', [])])
        day_plan_html += f"""
        <div style="margin-bottom: 24px;">
            <h3 style="color: #2563eb; margin-bottom: 12px;">📅 Day {day.get('day', 'N/A')}</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
                {activities_list}
            </ul>
        </div>
        """
    
    # Build packing list HTML
    packing_html = "".join([f"<li style='margin-bottom: 4px;'>✓ {item}</li>" for item in packing_list])
    
    # Complete HTML email
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 32px;">✈️ Your Trip is Ready to Book!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Trip to {destination}</p>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 8px 0; color: #1e40af;">📋 Trip Summary</h2>
            <div style="color: #1e40af;">
                <div><strong>Destination:</strong> {destination}</div>
                <div><strong>Duration:</strong> {days} days</div>
                <div><strong>Budget:</strong> {budget}</div>
            </div>
        </div>
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">✈️ Flight Options</h2>
        {flights_html}
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px;">🏨 Hotel Recommendations</h2>
        {hotels_html}
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px;">📅 Daily Itinerary</h2>
        {day_plan_html}
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px;">🎒 Packing List</h2>
        <ul style="color: #4b5563; columns: 2; -webkit-columns: 2; -moz-columns: 2;">
            {packing_html}
        </ul>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-top: 30px;">
            <h3 style="margin: 0 0 8px 0; color: #92400e;">🍽️ Food & Culture</h3>
            <p style="margin: 0; color: #78350f;">{food_culture.get('cuisine_summary', 'Enjoy the local cuisine!')}</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="color: #6b7280; margin: 0;">Have a wonderful trip! 🌍</p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Generated by Trip Pick</p>
        </div>
    </body>
    </html>
    """
    return html


def _send_approval_email(email_to: str, prefs: dict, itinerary: dict) -> tuple:
    """Send a beautifully formatted HTML itinerary email when approved. Returns (sent: bool, error: Optional[str])."""
    try:
        subject = '✅ Your Trip Itinerary is Ready to Book!'
        html_content = _generate_itinerary_html(prefs, itinerary)
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'no-reply@trippick.local'
        
        msg = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=from_email,
            to=[email_to]
        )
        msg.content_subtype = "html"  # Set content type to HTML
        msg.send(fail_silently=False)
        
        return True, None
    except Exception as e:
        logger.exception('Failed to send approval email to %s', email_to)
        return False, str(e)


def _send_approval_email_async(email_to: str, prefs: dict, itinerary: dict):
    """Wraps the approval email function in a thread to run in the background."""
    def send_sync():
        sent, err = _send_approval_email(email_to, prefs, itinerary)
        if not sent:
            logger.error(f"ASYNC APPROVAL EMAIL FAILED: {err} to {email_to}")
        else:
            logger.info(f"Approval email sent successfully to {email_to}")
        
    thread = threading.Thread(target=send_sync)
    thread.start()
    return True, None 

class GenerateItineraryView(APIView):
    """
    POST /api/planner/generate/ - Generates itinerary.
    """
    def post(self, request):
        prefs = request.data.get('preferences', {})
        result = orchestrate_itinerary({'preferences': prefs})

        # DO NOT send email here - only send when user approves
        resp = {
            'itinerary': result,
            'email_sent': False,
            'email_error': None,
        }

        return Response(resp, status=status.HTTP_200_OK)


class SaveItineraryView(APIView):
    """
    POST /api/planner/save/ - Saves itinerary for the authenticated user.
    """
    permission_classes = [IsAuthenticated] # <--- ENFORCE LOGIN

    def post(self, request):
        data = request.data
        
        # --- CRITICAL FIX: Use authenticated user object for the FK ---
        it = Itinerary.objects.create(
            user=request.user, # Use the request.user object (Django FK)
            preferences=data.get('preferences', {}),
            itinerary=data.get('itinerary', {})
        )
        serializer = ItinerarySerializer(it)
        
        # DO NOT send email here - only send when user approves
        resp = serializer.data
        resp.update({
            'email_sent': False,
            'email_error': None,
        })

        return Response(resp, status=status.HTTP_201_CREATED)


class UserItinerariesView(APIView):
    """
    GET /api/planner/history/ - Returns list of saved itineraries for the authenticated user.
    """
    permission_classes = [IsAuthenticated] # <--- ENFORCE LOGIN

    def get(self, request):
        # --- CRITICAL FIX: Filter by authenticated user object ---
        items = Itinerary.objects.filter(user=request.user).order_by('-created_at')
        serializer = ItinerarySerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApproveItineraryView(APIView):
    """
    POST /api/planner/approve/ - Finalizes the itinerary status to 'APPROVED' and sends the final email.
    """
    permission_classes = [IsAuthenticated] # <--- ENFORCE LOGIN

    def post(self, request):
        itinerary_id = request.data.get('itinerary_id')
        new_status = 'APPROVED'
        
        itinerary = get_object_or_404(Itinerary, pk=itinerary_id)
        
        # 1. Authorization Check 
        if itinerary.user != request.user:
            return Response({'error': 'Not authorized to modify this itinerary.'}, status=status.HTTP_403_FORBIDDEN)
            
        # 2. Update Status
        try:
            itinerary.status = new_status
            itinerary.save()
            
            # 3. Send beautifully formatted approval email with HTML
            email_to = request.user.email 
            
            if email_to:
                _send_approval_email_async(email_to, itinerary.preferences, itinerary.itinerary)
                email_message = "Your itinerary has been sent to your email with booking details!"
            else:
                email_message = "No email address found for user."

            return Response({
                'id': itinerary.id,
                'status': itinerary.status,
                'message': f"Itinerary approved! {email_message}",
                'email_sent': bool(email_to),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to update itinerary status: {e}")
            return Response({'error': 'Could not save new status.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteItineraryView(APIView):
    """
    DELETE /api/planner/delete/<id>/ - Deletes a saved itinerary for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, itinerary_id):
        itinerary = get_object_or_404(Itinerary, pk=itinerary_id)
        
        # Authorization Check - ensure user owns this itinerary
        if itinerary.user != request.user:
            return Response({'error': 'Not authorized to delete this itinerary.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            itinerary.delete()
            return Response({'message': 'Itinerary deleted successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to delete itinerary: {e}")
            return Response({'error': 'Could not delete itinerary.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)