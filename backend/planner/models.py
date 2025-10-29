from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone

# User model for foreign key relationship
User = get_user_model()

# Define the final status choices for the HiTL workflow (Recommendation Scope)
STATUS_CHOICES = (
    ('GENERATED', 'Generated'),
    ('APPROVED', 'Approved by User (Ready to Book)'),
    ('CANCELLED', 'Cancelled'),
)


class Itinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    preferences = models.JSONField(default=dict)
    itinerary = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='GENERATED',
        help_text="The current status of the itinerary in the approval lifecycle."
    )


    def __str__(self):
        return f"Itinerary {self.id} for {self.user.username if self.user else 'Guest'}"

