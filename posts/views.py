from django.shortcuts import render
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from connections.models import Follow
from communities.models import CommunityMember, CommunityPost
from communities.serializers import CommunityPostSerializer
from notifications.models import Notification

from .models import Post, Like, Comment, SavedPost
from .serializers import (
    PostSerializer,
    LikeSerializer,
    CommentSerializer,
    SavedPostSerializer
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):

    title = request.data.get('title', '').strip()
    content = request.data.get('content', '').strip()

    if not title:
        return Response({
            "error": "Title is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    if not content:
        return Response({
            "error": "Content is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = PostSerializer(
        data=request.data,
        context={"request": request}
    )

    if serializer.is_valid():
        serializer.save(user=request.user)

        return Response({
            "message": "Post created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_posts(request):

    posts = Post.objects.all().order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 6

    result_page = paginator.paginate_queryset(posts, request)

    serializer = PostSerializer(
        result_page,
        many=True,
        context={"request": request}
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):

    posts = Post.objects.filter(
        user=request.user
    ).order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 6

    result_page = paginator.paginate_queryset(posts, request)

    serializer = PostSerializer(
        result_page,
        many=True,
        context={"request": request}
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_post(request, id):

    try:
        post = Post.objects.get(
            id=id,
            user=request.user
        )

    except Post.DoesNotExist:
        return Response({
            "error": "Post not found or unauthorized"
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = PostSerializer(
        post,
        data=request.data,
        partial=True,
        context={"request": request}
    )

    if serializer.is_valid():
        serializer.save()

        return Response({
            "message": "Post updated successfully",
            "data": serializer.data
        })

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, id):

    try:
        post = Post.objects.get(
            id=id,
            user=request.user
        )

    except Post.DoesNotExist:
        return Response({
            "error": "Post not found or unauthorized"
        }, status=status.HTTP_404_NOT_FOUND)

    post.delete()

    return Response({
        "message": "Post deleted successfully"
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, id):

    try:
        post = Post.objects.get(id=id)

    except Post.DoesNotExist:
        return Response({
            "error": "Post not found"
        }, status=status.HTTP_404_NOT_FOUND)

    like, created = Like.objects.get_or_create(
        user=request.user,
        post=post
    )

    if not created:
        return Response({
            "message": "Post already liked"
        }, status=status.HTTP_200_OK)

    if post.user != request.user:
        Notification.objects.create(
            user=post.user,
            sender=request.user,
            notification_type='like',
            message=f"{request.user.username} liked your post"
        )

    serializer = LikeSerializer(like)

    return Response({
        "message": "Post liked successfully",
        "data": serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unlike_post(request, id):

    try:
        like = Like.objects.get(
            user=request.user,
            post_id=id
        )

    except Like.DoesNotExist:
        return Response({
            "error": "Like not found"
        }, status=status.HTTP_404_NOT_FOUND)

    like.delete()

    return Response({
        "message": "Post unliked successfully"
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, id):

    content = request.data.get('content', '').strip()
    parent_id = request.data.get('parent')
    if not content:
        return Response({
            "error": "Comment content is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        post = Post.objects.get(id=id)

    except Post.DoesNotExist:
        return Response({
            "error": "Post not found"
        }, status=status.HTTP_404_NOT_FOUND)
    parent_comment = None
    if parent_id:
        try:
            parent_comment = Comment.objects.get(
                id=parent_id,
                post=post
            )
        except Comment.DoesNotExist:
            return Response({
                "error":"Parent comment not found"

            },status = status.HTTP_404_NOT_FOUND)

    serializer = CommentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(
            user=request.user,
            post=post,
            parent=parent_comment
        )
        if parent_comment:
            if parent_comment.user != request.user:
                Notification.objects.create(
                    user=parent_comment.user,
                    sender=request.user,
                    notification_type='comment',
                    message=f"{request.user.username} replied to your comment"
                )
        else:
            if post.user != request.user:
                Notification.objects.create(
                    user=post.user,
                    sender=request.user,
                    notification_type='comment',
                    message=f"{request.user.username} commented on your post"
            )

        return Response({
            "message": "Comment added successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

# fetch all the comments that are on that post
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_comments(request, id):

    comments = Comment.objects.filter(
        post_id=id,
        parent__isnull = True
    ).order_by('-created_at')

    serializer = CommentSerializer(
        comments,
        many=True
    )

    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_post(request, id):

    try:
        post = Post.objects.get(id=id)

    except Post.DoesNotExist:
        return Response({
            "error": "Post not found"
        }, status=status.HTTP_404_NOT_FOUND)

    saved_post, created = SavedPost.objects.get_or_create(
        user=request.user,
        post=post
    )

    if not created:
        return Response({
            "message": "Post already saved"
        }, status=status.HTTP_200_OK)

    serializer = SavedPostSerializer(saved_post)

    return Response({
        "message": "Post saved successfully",
        "data": serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_post(request, id):

    try:
        saved_post = SavedPost.objects.get(
            user=request.user,
            post_id=id
        )

    except SavedPost.DoesNotExist:
        return Response({
            "error": "Saved post not found"
        }, status=status.HTTP_404_NOT_FOUND)

    saved_post.delete()

    return Response({
        "message": "Post removed from saved posts"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_posts(request):

    saved = SavedPost.objects.filter(
        user=request.user
    ).order_by('-created_at')

    serializer = SavedPostSerializer(
        saved,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_feed(request):

    followed_user_ids = Follow.objects.filter(
        follower=request.user
    ).values_list('following_id', flat=True)

    posts = Post.objects.filter(
        Q(user=request.user) |
        Q(user__id__in=followed_user_ids)
    ).order_by('-created_at')

    joined_community_ids = CommunityMember.objects.filter(
        user=request.user
    ).values_list('community_id', flat=True)

    community_posts = CommunityPost.objects.filter(
        community_id__in=joined_community_ids
    ).exclude(
        user=request.user
    ).order_by('-created_at')

    post_serializer = PostSerializer(
        posts,
        many=True,
        context={"request": request}
    )

    community_post_serializer = CommunityPostSerializer(
        community_posts,
        many=True
    )

    return Response({
        "message": "Activity feed retrieved successfully",
        "personal_posts": post_serializer.data,
        "posts_from_communities": community_post_serializer.data
    })



@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_comment(request,id):

    content = request.data.get('content','').strip()

    if not content:
        return Response({
            "error": "Comment content is required"
        },status = status.HTTP_400_BAD_REQUEST)
    
    try:
        comment = Comment.objects.get(
            id=id,
            user=request.user
        )

    except Comment.DoesNotExist:
        return Response({
            "error": "Comment not found or unauthorized"
        },status = status.HTTP_404_NOT_FOUND)
        
    comment.content = content
    comment.save()

    serializer = CommentSerializer(comment)
    return Response({
        "message": "Comment updated successfully",
        "data": serializer.data
    })



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def delete_comment(request,id):

    try:
        comment = Comment.objects.get(id = id)
        
    except Comment.DoesNotExist:
        return Response({
            "error": "Comment not found"
        }, status = status.HTTP_404_NOT_FOUND)
    
    if comment.user != request.user and comment.post.user != request.user:
        return Response({
            "error": "Unauthorized to delete this comment"
        }, status = status.HTTP_403_FORBIDDEN)
    
    comment.delete()
    return Response({
        "message": "Comment deleted successfully"
    }, status = status.HTTP_200_OK)
