from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):

    user = models.ForeignKey(
        User,
        on_delete = models.CASCADE
    )

    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

# Create your models here.


class Like(models.Model):

    class Meta:
        unique_together = ('user', 'post')
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked {self.post.title}"


class Comment(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    post = models.ForeignKey(
        Post,
        on_delete= models.CASCADE
    )


    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add =True)

    def __str__(self):
        return f"{self.user.username} commented on {self.post.title}"