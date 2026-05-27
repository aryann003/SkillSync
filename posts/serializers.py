from rest_framework import serializers
from .models import Post, Like, Comment

class PostSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'username',
            'profile_image',
            'title',
            'content',
            'likes_count',
            'comments_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user',
                            'created_at',
                            'updated_at'
                            ]
    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def get_profile_image(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.profile_image:
            return profile.profile_image.url
        return None
        

class LikeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Like
        fields = [
            'id',
            'user',
            'username',
            'post',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'username',
            'profile_image',
            'post',
            'content',
            'created_at',
        ]
        read_only_fields = ['user', 'post', 'created_at']

    def get_profile_image(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.profile_image:
            return profile.profile_image.url
        return None
