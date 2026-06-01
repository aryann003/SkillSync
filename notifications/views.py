from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifications = Notification.objects.filter(
        user = request.user
    )

    serializer = NotificationSerializer(
        notifications,
        many = True
    )
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def unread_notifications(request):
    notifications = Notification.objects.filter(
        user = request.user,
        is_read = False
    )

    serializer = NotificationSerializer(
        notifications,
        many = True
    )
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, id):
    try:
        notification = Notification.objects.get(
            id = id,
            user = request.user
        )

    except Notification.DoesNotExist:
        return Response({
            "error" : "Notification not found"
        }, status = status.HTTP_404_NOT_FOUND)
    
    notification.is_read = True
    notification.save()

    return Response({
        "message" : "Notification marked as read"
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])

def mark_all_as_read(request):
    notifications = Notification.objects.filter(
        user = request.user,
        is_read = False
    ).update(is_read = True)

    return Response({
        "message" : "All notifications marked as read"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def notification_count(request):
    unread_count = Notification.objects.filter(
        user = request.user,
        is_read = False
    ).count()

    total_count = Notification.objects.filter(
        user = request.user
    ).count()

    return Response({
        'unread_count' : unread_count,
        'total_count': total_count
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def delete_notification(request, id):
    try:
        notification = Notification.objects.get(
            id = id,
            user = request.user
        )

    except Notification.DoesNotExist:
        return Response({
            "error" : "Notification not found"
        }, status = status.HTTP_404_NOT_FOUND)
    
    notification.delete()

    return Response({
        "message" : "Notification delete successfully"
    }, status = status.HTTP_200_OK)
