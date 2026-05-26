from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .models import Follow
from .serializers import FollowSerializer, UserBasicSerializer



@api_view(['POST'])
@permission_classes([IsAuthenticated])

def follow_user(request, id):

    try:
        user_to_follow = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response({
            "error":"User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.user == user_to_follow:
        return Response({
            "error": "You cannot follow yourself"
        }, status=status.HTTP_404_BAD_REQUEST)
    

    follow, created = Follow.objects.get_or_created(
        follower=request.user,
        following=user_to_follow
    )

    if not created:
        return Response({
            "error": "You are already following this user"
        })
    
    serializer = FollowSerializer(follow)


    return Response({
        "message": "User followed successfully",
        "data": serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def unfollow_user(request, id):

    try:
        follow = Follow.objects.get(
            follower=request.user,
            following_id=id
        )

    except Follow.DoesNotExist:
        return Response({
            "error": "You are not following this user"
        }, status=status.HTTP_404_NOT_FOUND)
    
    follow.delete()


    return Response({
        "message": "User unfollowed successfully"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def followers_list(request, id):

    try:
        user = User.objects.get(id=id)

    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        },status = status.HTTP_404_NOT_FOUND)
    
    followers= Follow.objects.filter(
        following=user
    )

    serializer = FollowSerializer(
        followers,
        many=True
    )

    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])

def following_list(request, id):

    try:
        user = User.objects.get(id=id)

    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        },status = status.HTTP_404_NOT_FOUND)
    
    following = Follow.objects.filter(
        follower = user 
    )

    serializer = FollowSerializer(
        following,
        many = True
    )

    return Response(serializer.data)