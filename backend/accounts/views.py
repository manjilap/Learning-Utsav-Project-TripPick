from django.shortcuts import render, redirect
from rest_framework.generics import GenericAPIView
from .serializers import (UserRegisterSerializer, UserLoginSerializer, 
                        PasswordResetSerializer, SetNewPasswordSerializer,
                        PasswordResetConfirmSerializer, LogoutUserSerializer)
from rest_framework.response import Response
from rest_framework import status
from .utils import send_verification_email
from .models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import JsonResponse
from django.conf import settings

def health(request):
    return JsonResponse({"ok": True, "service": "backend", "message":"Django is running"})

class RegisterUserView(GenericAPIView):
    serializer_class= UserRegisterSerializer

    def post(self, request):
        user_data=request.data
        serializer=self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user=serializer.data
            # send verification email with link
            send_verification_email(user['email'], request)
            return Response(
                {
                    'data': user,
                    'message': 'User Created Successfully. Check your email to verify your account',
                }, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
    
class VerifyUserEmail(GenericAPIView):
    """Verify user email using verification token from email link"""
    def get(self, request, token):
        try:
            user = User.objects.get(verification_token=token)
            if not user.is_verified:
                user.is_verified = True
                user.verification_token = None  # Clear the token after verification
                user.save()
                # Redirect to frontend with success message
                frontend_url = settings.SITE_URL
                return redirect(f"{frontend_url}/signin?verified=true")
            # Already verified, redirect to frontend
            frontend_url = settings.SITE_URL
            return redirect(f"{frontend_url}/signin?verified=already")
        except User.DoesNotExist:
            # Invalid token, redirect to frontend with error
            frontend_url = settings.SITE_URL
            return redirect(f"{frontend_url}/signin?verified=false")
        
class LoginUserView(GenericAPIView):
    serializer_class= UserLoginSerializer
    def post(self, request):
        print("request", request.data)
        serializer=self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        data = {
            'msg': 'Authenticated',
        }
        return Response(data, status=status.HTTP_200_OK)
    

class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context = {'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(
            {'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK
        )
    
class PasswordResetConfirmView(GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer

    def get(self, request, uid64, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uid64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response(
                    {'message': 'Token is invalid or expired'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({
                'success': True,
                'message': 'Token is valid',
                'uid64': uid64,
                'token': token
            }, status=status.HTTP_200_OK)
        
        except DjangoUnicodeDecodeError:
            return Response(
                {'message': 'Token is invalid or expired'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
class SetNewPassword(GenericAPIView):
    serializer_class= SetNewPasswordSerializer
    def patch(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {
                'success': True,
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK
        )

class LogoutUserView(GenericAPIView):
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)