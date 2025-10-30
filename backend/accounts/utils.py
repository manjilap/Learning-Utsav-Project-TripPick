from django.core.mail import EmailMessage
from django.conf import settings
from .models import User


def send_verification_email(email, request):
    """Send email verification link to user"""
    user = User.objects.get(email=email)
    
    # Generate verification token
    token = user.generate_verification_token()
    
    # Build verification URL
    current_site = request.get_host()
    verification_link = f"http://{current_site}/api/accounts/verify-email/{token}/"
    
    subject = "Verify Your Email Address"
    email_body = f"""Hi {user.first_name},

Thank you for signing up!

Please verify your email address by clicking the link below:
{verification_link}

If you didn't create an account, please ignore this email.

Thanks,
Trip Pick Team"""
    
    from_email = settings.DEFAULT_FROM_EMAIL
    
    send_email = EmailMessage(subject=subject, body=email_body, from_email=from_email, to=[email])
    send_email.send(fail_silently=True)


def send_normal_email(data):
    email = EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']]
    )
    email.send(fail_silently=True)



# def send_email_to_user(email, subject, message):
#     email = EmailMessage(subject, message, to=[email])
#     email.send()

# def send_email_to_multiple_users(emails, subject, message):
#     email = EmailMessage(subject, message, to=emails)