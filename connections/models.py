from django.db import models
from django.contrib.auth.models import User

#stores relation like aryan follows rahul
#rahul follows neha
class Follow(models.Model):

    follower = models.ForeignKey(User,
                                 on_delete=models.CASCADE,
                                 related_name='following')
    
    following = models.ForeignKey(User,
                                  on_delete=models.CASCADE,
                                  related_name='followers')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"





class Block(models.Model):
    blocker = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocking'

    )  
    blocked = models.ForeignKey(
        User,
        on_delete = models.CASCADE,
        related_name='blocked_by'
    )
    created_at = models.DateTimeField(auto_now_add = True)


    class Meta:
        unique_together = ['blocker','blocked']

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"
    
