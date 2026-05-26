from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Follow


class UserBasicSerializer(serializers.ModelSerializer):
#returns detail of followers
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email'
        ]

class FollowSerializer(serializers.ModelSerializer):

    follower = UserBasicSerializer(read_only=True)
    following = UserBasicSerializer(read_only=True)

    class Meta:
        model = Follow
        fields=[
            'id',
            'follower',
            'following',
            'created_at'
        ]