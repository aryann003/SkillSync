from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Report
from posts.models import Post, Comment
from .serializers import ReportSerializer



@api_view(['POST'])
@permission_classes([IsAuthenticated])


def report_post(request,id):
    try:
        post = Post.objects.get(id=id)

    except Post.DoesNotExist:
        return Response({
            "error":"Post not found"
        },status = status.HTTP_404_NOT_FOUND)
    
    if post.user == request.user:
        return Response({
            "error":"You cannot report your own post"
        },status = status.HTTP_400_BAD_REQUEST)
    

    if Report.objects.filter(
        reported_by = request.user,
        post = post
    ).exists():
        return Response({
            "error":"You have already reported this post"
        },status = status.HTTP_400_BAD_REQUEST)
    
    serializer = ReportSerializer(data = request.data)

    if serializer.is_valid():
        serializer.save(
            reported_by = request.user,
            post = post
        )
        return Response({
            "message": "Post reported successfully",
            "data": serializer.data
        },status = status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])

def report_comment(request,id):

    try:
        comment = Comment.objects.get(id = id)

    except Comment.DoesNotExist:
        return Response({
            "error" : "Comment not found"

        }, status = status.HTTP_404_NOT_FOUND)
    
    if comment.user == request.user:
        return Response({
            "error": "You cannot report your own comment"
        }, status = status.HTTP_400_BAD_REQUEST)

    if Report.objects.filter(
        reported_by = request.user,
        comment = comment
    ).exists():
        return Response({
            "error": "You have already reported this comment"
        }, status = status.HTTP_400_BAD_REQUEST)
    

    serializer = ReportSerializer(data = request.data)

    if serializer.is_valid():
        serializer.save(
            reported_by = request.user,
            comment = comment
        )

        return Response({
            "message": "Comment reported successfully",
            "data": serializer.data
        }, status = status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])

def my_reports(request):
    reports = Report.objects.filter(
        reported_by = request.user
    )

    serializer = ReportSerializer(
        reports,
        many = True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_reports(request):

    if not request.user.is_staff:
        return Response({
            "error": "Only admin can access this API"
        }, status=status.HTTP_403_FORBIDDEN)

    reports = Report.objects.all()

    serializer = ReportSerializer(
        reports,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_reports(request):

    if not request.user.is_staff:
        return Response({
            "error": "Only admin can access this API"
        }, status=status.HTTP_403_FORBIDDEN)

    reports = Report.objects.filter(
        status='pending'
    )

    serializer = ReportSerializer(
        reports,
        many=True
    )

    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_report_status(request, id):

    if not request.user.is_staff:
        return Response({
            "error": "Only admin can update report status"
        }, status=status.HTTP_403_FORBIDDEN)

    new_status = request.data.get('status', '').strip()

    valid_statuses = ['pending', 'reviewed', 'resolved', 'rejected']

    if new_status not in valid_statuses:
        return Response({
            "error": "Invalid status",
            "valid_statuses": valid_statuses
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        report = Report.objects.get(id=id)

    except Report.DoesNotExist:
        return Response({
            "error": "Report not found"
        }, status=status.HTTP_404_NOT_FOUND)

    report.status = new_status
    report.save()

    serializer = ReportSerializer(report)

    return Response({
        "message": "Report status updated successfully",
        "data": serializer.data
    })
