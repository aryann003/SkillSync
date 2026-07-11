from django.db import models
from django.contrib.auth.models import User

from posts.models import Post, Comment



class Report(models.Model):

    REASON_CHOICES= (
        ('spam','Spam'),
        ('abuse', 'Abuse'),
        ('fake', 'Fake COntent'),
        ('irrelevant', 'Irrelevant'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewed','Reviewed'),
        ('resolved','Resolved'),
        ('rejected','Rejected'),
    )


    reported_by = models.ForeignKey(
        User,
        on_delete = models.CASCADE,
        related_name = 'reports_made'
    )

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name = 'reports'
    )

    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name = 'reports'
    )

    reason = models.CharField(
        max_length=20,
        choices=REASON_CHOICES
    )

    description = models.TextField(
        blank = True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )       

    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reported_by.username} reported{self.reason}"
    


