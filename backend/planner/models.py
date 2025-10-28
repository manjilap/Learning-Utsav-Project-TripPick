from django.db import models
from django.conf import settings
from django.utils import timezone


class Itinerary(models.Model):
    #id will be automatic 
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    preferences = models.JSONField(default=dict)
    itinerary = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Itinerary {self.id} - user={self.user}"
