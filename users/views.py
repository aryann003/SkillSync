from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q
from django.contrib.auth.models import User

from .serializers import RegisterSerializer, ProfileSerializer
from .models import Profile

from rest_framework.pagination import PageNumberPagination

def _split_terms(value):
    if not value:
        return []
    return [term.strip() for term in value.split(",") if term.strip()]


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

    username = request.data.get('username')
    if username is not None:
        username = username.strip()
        if len(username) < 3:
            return Response({
                "error": "Username must be at least 3 characters"
            }, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exclude(id=request.user.id).exists():
            return Response({
                "error": "Username already taken"
            }, status=status.HTTP_400_BAD_REQUEST)
        request.user.username = username
        request.user.save()

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

    paginator = PageNumberPagination()
    paginator.page_size = 6
    result_page = paginator.paginate_queryset(profiles, request)
    serializer = ProfileSerializer(
        result_page,
        many=True
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_users(request):

    my_profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    interest_terms = _split_terms(my_profile.interests)
    skill_terms = _split_terms(my_profile.skills)
    profession_terms = _split_terms(my_profile.profession)

    if not interest_terms and not skill_terms and not profession_terms:
        return Response({
            "message": "Add interests, skills, or profession to your profile",
            "data": []
        })

    query = Q()

    for term in interest_terms:
        query |= Q(interests__icontains=term)
    for term in skill_terms:
        query |= Q(skills__icontains=term)
    for term in profession_terms:
        query |= Q(profession__icontains=term)

    recommended = Profile.objects.filter(query).exclude(user=request.user).distinct()

    paginator = PageNumberPagination()
    paginator.page_size = 6
    result_page = paginator.paginate_queryset(recommended, request)

    serializer = ProfileSerializer(
        result_page,
        many=True
    )

    return paginator.get_paginated_response(serializer.data)
