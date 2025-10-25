from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import smart_str, smart_bytes, force_str
from .utils import send_normal_email
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    password2 = serializers.CharField(max_length=68, min_length=6, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, attrs):
        password = attrs.get('password', '')
        password2 = attrs.get('password2', '')
        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=validated_data.get('password')
        )
        return user
    
class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255, min_length=3)
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    full_name = serializers.CharField(max_length=255, read_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'access_token', 'refresh_token']
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        request = self.context.get('request')
        user = authenticate(request, email=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid credentials, try again')

        if not user.is_verified:
            raise AuthenticationFailed('Account is not verified')


        user_tokens = user.tokens()
        return {
            'email': user.email,
            'full_name': user.get_full_name(),
            'access_token': str(user_tokens.get('access')),
            'refresh_token': str(user_tokens.get('refresh'))
        }

        return super().validate(attrs)
    

class PasswordResetSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255, min_length=3)
    
    class Meta:
        model = User
        fields = ['email']

    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uid64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            request = self.context.get('request')
            site_domain = get_current_site(request).domain
            relative_link = reverse('password_reset_confirm', kwargs={'uid64': uid64, 'token': token})
            absurl = f"http://{site_domain}{relative_link}"
            email_body = f"Hello {user.first_name},\nUse the link below to reset your password:\n{absurl}"
            data = {
                'email_body': email_body,
                'to_email': user.email,
                'email_subject': 'Reset your password'
            }
            send_normal_email(data)
            return attrs
        raise serializers.ValidationError('User with this email does not exist')

class SetNewPasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=100, min_length=6, write_only=True)
    confirm_password = serializers.CharField(max_length=100, min_length=6, write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['password', 'confirm_password', 'uidb64', 'token']

    def validate(self, attrs):
        try:
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')
            password = attrs.get('password')
            confirm_password = attrs.get('confirm_password')

            if password != confirm_password:
                raise serializers.ValidationError({'error': 'Passwords do not match'})

            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError({'error': 'Reset link is invalid or expired'})
            
            user.set_password(password)
            user.save()
            return attrs

        except (TypeError, ValueError, User.DoesNotExist):
            raise serializers.ValidationError({'error': 'Invalid reset link'})

                
class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=1, write_only=True)
    uid64 = serializers.CharField(min_length=1, write_only=True)

    class Meta:
        fields = ['uid64', 'token']

    def validate(self, attrs):
        return attrs

class LogoutUserSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(max_length=255, min_length=1, write_only=True)

    default_error_messages = {
        'bad_token': 'Token is invalid or expired'
    }

    class Meta:
        fields = ['refresh_token']

    def validate(self, attrs):
        self.token = attrs.get('refresh_token')
        return attrs
    
    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
            return True
        except TokenError:
            return super().fail('bad_token')