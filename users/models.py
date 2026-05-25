from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user =  models.OneToOneField(User,on_delete=models.CASCADE)

    bio = models.TextField(blank = True)
    skills = models.CharField(max_length=250, blank = True)

    profile_image = models.ImageField(
        upload_to='profiles/',
        blank = True,
        null = True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

# Create your models here.
