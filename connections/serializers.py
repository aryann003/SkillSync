from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Block, Follow


class UserBasicSerializer(serializers.ModelSerializer):
#returns detail of followers
    class Meta:
        model = User
        fields = [
            'id',
            'username',
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


class BlockSerializer(serializers.ModelSerializer):
    blocker = UserBasicSerializer(read_only = True)
    blocked = UserBasicSerializer(read_only = True)

    class Meta:
        model = Block
        fields = [
        'id',
        'blocker',
        'blocked',
        'created_at'
        ]
