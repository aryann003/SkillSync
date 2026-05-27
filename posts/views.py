from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated


from rest_framework.response import Response
from rest_framework import status
from .models import Post, Like, Comment
from .serializers import PostSerializer, LikeSerializer, CommentSerializer


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
        }, status = status.HTTP_400_BAD_REQUEST)

    serializer = PostSerializer(data=request.data)

    if serializer.is_valid():
        # automatically set the user to the logged in user
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

    serializer = PostSerializer(posts, many=True)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):

    posts = Post.objects.filter(
        user=request.user
    ).order_by('-created_at')

    serializer = PostSerializer(
        posts,
        many=True
    )

    return Response(serializer.data)

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
        partial=True
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
            id = id,
            user = request.user
        )

    except Post.DoesNotExist:

        return Response({
            "error":  " Post not found or unauthorized"
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
            user = request.user,
            post_id = id
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

    if not content:
        return Response({
            "error" : "comment content is required"
        }, status=status.HTTP_400_BAD_REQUEST)
    try:
        post = Post.objects.get(id=id)

    except Post.DoesNotExist:

        return Response({
            "error": "Post not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CommentSerializer(data=request.data)


    if(serializer.is_valid()):

        serializer.save(user=request.user,
                        post = post)
        
        return Response({
            "message": "Comment added successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])

def post_comments(request, id):

    comments = Comment.objects.filter(
        post_id = id
    ).order_by('-created_at')

    serializer = CommentSerializer(
        comments,
        many=True
    )


    return Response(serializer.data)
