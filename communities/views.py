from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


from .models import Community, CommunityMember, CommunityPost
from .serializers import (
    CommunitySerializer,
    CommunityMemberSerializer,
    CommunityPostSerializer
)

from django.db.models import Q
from users.models import Profile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_community(request):

    serializer = CommunitySerializer(data=request.data)
    #this line sends data to serializer where serializer checks if data is valid

    if serializer.is_valid():
        #creates a new community in the database
        community = serializer.save(
            #assign login user as the creater
            created_by = request.user
        )
# creater automatically becomes a member of the community
        CommunityMember.objects.create(
            user=request.user,
            community=community
        )
        return Response({
            'message': "Community created successfully",
            'data': serializer.data
        }, status = status.HTTP_201_created)
    
    return Response(
        serializer.errors,
        status = status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])

def list_communities(request):

    communities = Community.objects.all().order_by('-created_at')

    serializer = CommunitySerializer(
        communities,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])

def community_details(request, id):

    try:
        community = Community.objects.get(id=id)

    except Community.DoesNotExist:
        return Response({
            "error": "Community not found"
        }, status = status.HTTP_404_NOT_FOUND)
    
    serializer = CommunitySerializer(community)

    return Response(serializer.data)



#join commmunity

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def join_community(request, id):

    try:
        community = Community.objects.get(id=id)

    except Community.DoesNotExist:
        return Response({
            "error": "Community not found"
        },status = status.HTTP_404_NOT_FOUND)
    #this prevents duplicate entries in the community
    member, created = CommunityMember.objects.get_or_create(
        user = request.user,
        community = community
    )

    if not created:
        return Response({
            "message": "You are already a member of this community"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = CommunityMemberSerializer(member)

    return Response({
        "message": "You have joined the community successfully",
        "data": serializer.data
    }, status= status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def leave_community(request, id):

    try:
        member = CommunityMember.objects.get(
            user = request.user,
            community_id = id
        )
    except CommunityMember.DoesNotExist:
        return Response({
            "error": "You are not a member of this community"
        }, status = status.HTTP_400_BAD_REQUEST)

    member.delete()

    return Response({
        "message": "You have left the community successfully"
    }, status = status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_members(request, id):

    members = CommunityMember.objects.filter(
        community_id=id
    ).order_by('-joined_at')

    serializer = CommunityMemberSerializer(
        members,
        many=True
    )

    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_community_post(request, id):

    try:
        community = Community.objects.get(id=id)

    except Community.DoesNotExist:
        return Response({
            "error": "Community not found"
        }, status=status.HTTP_404_NOT_FOUND)

    is_member = CommunityMember.objects.filter(
        user=request.user,
        community=community
    ).exists()

    if not is_member:
        return Response({
            "error": "Join this community before posting"
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = CommunityPostSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save(
            user=request.user,
            community=community
        )

        return Response({
            "message": "Community post created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_posts(request, id):

    posts = CommunityPost.objects.filter(
        community_id=id
    ).order_by('-created_at')

    serializer = CommunityPostSerializer(
        posts,
        many=True
    )

    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_community_post(request, id):

    try:
        post = CommunityPost.objects.get(
            id=id,
            user=request.user
        )

    except CommunityPost.DoesNotExist:
        return Response({
            "error": "Post not found or you are not allowed to delete it"
        }, status=status.HTTP_404_NOT_FOUND)

    post.delete()

    return Response({
        "message": "Community post deleted successfully"
    }, status=status.HTTP_200_OK)



#search communities by name or description

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def search_communities(request):

    query = request.GET.get('q', '')

    communities = Community.objects.filter(
        Q(name_icontains=query) |
        Q(description_icontains=query)
    ).order_by('-created_at')

    serializer = CommunitySerializer(
        communities,
        many= True
    ) 

    return Response(serializer.data)


#recommendation

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def recommended_communities(request):

    try:
        profile = Profile.objects.get(user=request.user)

    except Profile.DoesNotExist:
        return Response({
            "error": "Profile not found"
        },status = status.HTTP_404_NOT_FOUND)
    
    query = profile.interests

    if not query:
        return Response({
            "message" : "Add interests to your profile",
            "data": []
        })
    
    communities = Community.objects.filter(
        Q(name_icontains=query) |
        Q(description_icontains=query)
    )

    serializer = CommunitySerializer(
        communities,
        many=True
    )
    return Response(serializer.data)