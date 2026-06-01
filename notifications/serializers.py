from rest_framework import serializers
from .models import *

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    def get_sender_name(self, obj):
        return obj.sender.username if obj.sender else None

    class Meta:
        model = Notification
        fields = [
            'id',
            'sender',
            'sender_name',
            'notification_type',
            'message',
            'is_read',
            'created_at'
        ]
        read_only_fields = [
            'notification_type',
            'sender',
            'sender_name',
            'created_at',
            'message'
        ]

        
