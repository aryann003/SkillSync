from tkinter import CASCADE

from django.db import models
from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('follow', 'Follow'),
        ('like', 'Like'),
        ('comment','Comment'),
        ('community_join','Community Join'),
        ('message', 'Message'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')


    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null= True, blank=True)


    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)

    message = models.TextField()
    is_read = models.BooleanField(default = False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']      
    def __str__(self):
        return self.message

