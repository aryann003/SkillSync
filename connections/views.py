from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .models import Block, Follow
from .serializers import BlockSerializer, FollowSerializer, UserBasicSerializer

from notifications.models import Notification


@api_view(['POST'])
@permission_classes([IsAuthenticated])

def follow_user(request, id):
    try:
        user_to_follow = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({
            "error":"User not found"
        }, status=status.HTTP_404_NOT_FOUND)

    if request.user == user_to_follow:
        return Response({
            "error": "You cannot follow yourself"
        }, status=status.HTTP_400_BAD_REQUEST)

    if Block.objects.filter(
        blocker=request.user,
        blocked=user_to_follow
    ).exists():
        return Response({
            "error": "You cannot follow a user you have blocked"
        }, status=status.HTTP_400_BAD_REQUEST)

    if Block.objects.filter(
        blocker=user_to_follow,
        blocked=request.user
    ).exists():
        return Response({
            "error": "You cannot follow this user"
        }, status=status.HTTP_403_FORBIDDEN)
    

    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )

    if not created:
        return Response({
            "message": "You are already following this user"
        })

    Notification.objects.create(
        user = user_to_follow,
        sender = request.user,
        notification_type = 'follow',
        message = f"{request.user.username} started following you."
    )
    
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



@api_view(['POST'])
@permission_classes([IsAuthenticated])

def block_user(request,id):

    try:
        user_to_block = User.objects.get(id=id)

    except User.DoesNotExist:
        return Response({
            "error":"User not found"
        },status = status.HTTP_404_NOT_FOUND)
    

    if request.user == user_to_block:
        return Response({
            "error":"You cannot block yourself"

        }, status = status.HTTP_400_BAD_REQUEST)

    block, created = Block.objects.get_or_create(
        blocker = request.user,
        blocked = user_to_block
    )

    if not created:
        return Response({
            "message": " User already blocked"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    Follow.objects.filter(
        follower = request.user,
        following = user_to_block
    ).delete()

    Follow.objects.filter(
        follower=user_to_block,
        following=request.user
    ).delete()

    serialiser = BlockSerializer(block)

    return Response({
        "message":"User blocked successfully",
        "data": serialiser.data
    }, status = status.HTTP_201_CREATED)    




@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unblock_user(request, id):

    try:
        block = Block.objects.get(
            blocker=request.user,
            blocked_id=id
        )

    except Block.DoesNotExist:
        return Response({
            "error": "Blocked user not found"
        }, status=status.HTTP_404_NOT_FOUND)

    block.delete()

    return Response({
        "message": "User unblocked successfully"
    }, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blocked_users(request):

    blocks = Block.objects.filter(
        blocker=request.user
    ).order_by('-created_at')

    serializer = BlockSerializer(
        blocks,
        many=True
    )

    return Response(serializer.data)
