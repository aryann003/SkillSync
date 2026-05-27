from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q

from .serializers import RegisterSerializer, ProfileSerializer
from .models import Profile


@api_view(['GET'])
def test(request):
    return Response({
        "message": "SkillSync API working"
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
    profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    serializer = ProfileSerializer(profile)

    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    serializer = ProfileSerializer(
        profile,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):

    query = request.GET.get('q', '').strip()

    if not query:
        return Response({
            "error": "Search query is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    profiles = Profile.objects.filter(
        Q(user__username__icontains=query) |
        Q(bio__icontains=query) |
        Q(interests__icontains=query) |
        Q(profession__icontains=query) |
        Q(skills__icontains=query)
    ).exclude(user=request.user).distinct()

    serializer = ProfileSerializer(
        profiles,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_users(request):

    my_profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    if not my_profile.interests and not my_profile.skills and not my_profile.profession:
        return Response({
            "message": "Add interests, skills, or profession to your profile",
            "data": []
        })

    recommended = Profile.objects.filter(
        Q(interests__icontains=my_profile.interests) |
        Q(skills__icontains=my_profile.skills) |
        Q(profession__icontains=my_profile.profession)
    ).exclude(user=request.user).distinct()

    serializer = ProfileSerializer(
        recommended,
        many=True
    )

    return Response(serializer.data)