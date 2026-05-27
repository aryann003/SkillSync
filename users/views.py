import django
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer, ProfileSerializer
from .models import Profile

from django.db.models import Q
from django.contrib.auth.models import User


 
@api_view(['GET'])
def test(request):
    return Response({
        "message": "skillSync API working"
    })


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "User Registration Successful"
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    profile = Profile.objects.get(user=request.user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = Profile.objects.get(user=request.user)

    serializer = ProfileSerializer(
        profile,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#search users by username, skills, interests, profession
@api_view(['GET'])
@permission_classes([IsAuthenticated])

def search_users(request):

    query = request.GET.get('q', '')

    profiles = Profile.objects.filter(
        Q(user_username_icontains=query) |
        Q(bio_icontains=query) |
        Q(interests_icontains=query) |
        Q(profession_icontains=query)|
        Q(skills_icontains=query)
    ).exclude(user = request.user)


    serializer = ProfileSerializer(
        profiles,
        many = True
    )

    return Response(serializer.data)


#recommendation 

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def recommended_users(request):

    try:
        my_profile = profile.objects.get(user=request.user)

    except Profile.DoesNotExist:
        return Response({
            "error": "Profile not found"
        },status = status.HTTP_404_NOT_Found)
    
    interests = my_profile.interests

    if not interests:
        return Response({
            "message" : "Add interests to your profile",
            "data" : []

        })
    
    recommended = Profile.objects.filters(
        Q(interests_icontains=interests) |
        Q(skills_icontains=my_profile.skills) |
        Q(profession_icontains=my_profile.profession)
    ).exclude(user=request.user)


    serializer = ProfileSerializer(
        recommended,
        many = True
    )
    return Response(serializer.data)
