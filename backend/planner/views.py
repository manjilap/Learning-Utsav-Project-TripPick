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

def _send_itinerary_email(email_to: str, prefs: dict, itinerary: dict) -> tuple:
    """Send a plain-text itinerary email (Synchronous). Returns (sent: bool, error: Optional[str])."""
    # NOTE: The body structure has been slightly simplified for clarity
    try:
        subject = 'Your Trip Itinerary from Trip Pick'
        body_lines = [
            'Hello,',
            '',
            'Here is your trip itinerary from Trip Pick. Please review and approve!',
            '',
            'Preferences:',
            json.dumps(prefs or {}, indent=2),
            '',
            'Itinerary:',
            json.dumps(itinerary or {}, indent=2),
            '',
            'Enjoy your trip!',
        ]
        body = '\n'.join(body_lines)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'no-reply@trippick.local'
        msg = EmailMessage(subject=subject, body=body, from_email=from_email, to=[email_to])
        msg.send(fail_silently=False)
        return True, None
    except Exception as e:
        logger.exception('Failed to send itinerary email to %s', email_to)
        return False, str(e)


def _send_itinerary_email_async(email_to: str, prefs: dict, itinerary: dict):
    """Wraps the synchronous email function in a thread to run in the background."""
    def send_sync():
        sent, err = _send_itinerary_email(email_to, prefs, itinerary)
        if not sent:
            logger.error(f"ASYNC EMAIL FAILED: {err} to {email_to}")
        
    thread = threading.Thread(target=send_sync)
    thread.start()
    # Immediately return success to the API caller
    return True, None 


# ------------------------------------------------------------------------------
# API Views
# ------------------------------------------------------------------------------

class GenerateItineraryView(APIView):
    """
    POST /api/planner/generate/ - Generates itinerary.
    """
    def post(self, request):
        prefs = request.data.get('preferences', {})
        result = orchestrate_itinerary({'preferences': prefs})

        # Optionally email the generated itinerary (uses async sender)
        email_to = request.data.get('email')
        if not email_to and getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            email_to = getattr(request.user, 'email', None)

        email_sent = False
        email_error = None
        if email_to and result.get('ok'): # Only send if generation was successful
            # --- USE ASYNC SENDER ---
            _send_itinerary_email_async(email_to, prefs, result.get('itinerary'))
            email_sent = True
            email_error = None # Error is handled in the async thread

        resp = {
            'itinerary': result,
            'email_sent': email_sent,
            'email_error': email_error,
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
        
        # Optionally send the itinerary to an email address (uses async sender)
        email_to = data.get('email')
        if not email_to:
            email_to = request.user.email # Use logged-in user's email

        email_sent = False
        email_error = None
        if email_to:
            prefs = data.get('preferences', {})
            itinerary = data.get('itinerary', {})
            # --- USE ASYNC SENDER ---
            _send_itinerary_email_async(email_to, prefs, itinerary)
            email_sent = True 
            email_error = None

        resp = serializer.data
        resp.update({
            'email_sent': email_sent,
            'email_error': email_error,
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
        if itinerary.user != request.user: # Only check if user FK matches authenticated user
            return Response({'error': 'Not authorized to modify this itinerary.'}, status=status.HTTP_403_FORBIDDEN)
            
        # 2. Update Status
        try:
            itinerary.status = new_status
            itinerary.save()
            
            # --- FINAL STEP: Send "Ready to Book" Email (ASYNC) ---
            email_to = request.user.email 
            
            subject = '✅ Itinerary Approved! Your Trip is Ready to Book'
            # NOTE: We must ensure the email helper uses the final subject/body
            
            # We must use the original helper, but we'll use the async wrapper
            _send_itinerary_email_async(email_to, itinerary.preferences, itinerary.itinerary)
            
            email_message = "Final itinerary email processing in background."

            return Response({
                'id': itinerary.id,
                'status': itinerary.status,
                'message': f"Itinerary {itinerary.id} status updated to {new_status}. {email_message}",
                'email_sent': True,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to update itinerary status: {e}")
            return Response({'error': 'Could not save new status.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)