from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .agents.orchestrator import orchestrate_itinerary
from .serializers import ItinerarySerializer
from .models import Itinerary

import json
import logging
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_itinerary_email(email_to: str, prefs: dict, itinerary: dict) -> tuple:
    """Send a plain-text itinerary email. Returns (sent: bool, error: Optional[str])."""
    try:
        subject = 'Your Trip Itinerary from Trip Pick'
        body_lines = [
            'Hello,',
            '',
            'Here is your generated trip itinerary from Trip Pick.',
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


class GenerateItineraryView(APIView):
    """
    POST /api/planner/generate/
    body: {"preferences": {...}} -> returns combined itinerary JSON
    """
    def post(self, request):
        prefs = request.data.get('preferences', {})
        result = orchestrate_itinerary({'preferences': prefs})
        # Optionally email the generated itinerary directly (without saving).
        email_to = request.data.get('email')
        if not email_to and getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            email_to = getattr(request.user, 'email', None)

        email_sent = False
        email_error = None
        if email_to:
            sent, err = _send_itinerary_email(email_to, prefs, result)
            email_sent = sent
            email_error = err

        resp = {
            'itinerary': result,
            'email_sent': email_sent,
            'email_error': email_error,
        }

        return Response(resp, status=status.HTTP_200_OK)


class SaveItineraryView(APIView):
    """
    POST /api/planner/save/
    body: { "user_id": null or id, "preferences": {...}, "itinerary": {...} }
    """
    def post(self, request):
        data = request.data
        it = Itinerary.objects.create(
            user_id=data.get('user_id'),
            preferences=data.get('preferences', {}),
            itinerary=data.get('itinerary', {})
        )
        serializer = ItinerarySerializer(it)
        
        # Optionally send the itinerary to an email address. Client can pass
        # 'email' in the POST body, or the authenticated user's email will be used.
        email_to = data.get('email')
        if not email_to and getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            email_to = getattr(request.user, 'email', None)

        email_sent = False
        email_error = None
        if email_to:
            prefs = data.get('preferences', {})
            itinerary = data.get('itinerary', {})
            sent, err = _send_itinerary_email(email_to, prefs, itinerary)
            email_sent = sent
            email_error = err

        resp = serializer.data
        resp.update({
            'email_sent': email_sent,
            'email_error': email_error,
        })

        return Response(resp, status=status.HTTP_201_CREATED)


class UserItinerariesView(APIView):
    def get(self, request, user_id):
        items = Itinerary.objects.filter(user_id=user_id).order_by('-created_at')
        serializer = ItinerarySerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
