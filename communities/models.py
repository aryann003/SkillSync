from django.db import models
from  django.contrib.auth.models import User

class Community(models.Model):

    name = models.CharField(max_length=100,unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='communities')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CommunityMembership(models.Model):

    user = models.ForeignKey(User,
                             on_delete=models.CASCADE
                             )
    
    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name='members'
    )

    joined_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ['user', 'community']

    def __str__(self):
        return f"{self.user.username} joined {self.community.name}"
    


class CommunityPost(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    community = models.ForeignKey(Community,
                                  on_delete=models.CASCADE,
                                  related_name='posts'
                                  )
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title