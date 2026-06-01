from rest_framework import serializers
from .models import Post, Like, Comment,SavedPost
MAX_POST_IMAGE_SIZE_MB = 5
MAX_POST_IMAGE_SIZE_BYTES = MAX_POST_IMAGE_SIZE_MB * 1024 * 1024

class PostSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

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
            'is_liked',
            'comments_count',
            'created_at',
            'updated_at',
            'image',
        ]
        read_only_fields = ['user',
                            'created_at',
                            'updated_at'
                            ]
    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def validate_image(self, value):
        if value and value.size > MAX_POST_IMAGE_SIZE_BYTES:
            raise serializers.ValidationError(
                f"Image size must be {MAX_POST_IMAGE_SIZE_MB} MB or less."
            )
        return value
    
    
    def get_is_liked(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return Like.objects.filter(post=obj, user=user).exists()

    def get_profile_image(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.profile_image:
            return profile.profile_image.url
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        image_path = data.get("image")
        if image_path and request:
            data["image"] = request.build_absolute_uri(image_path)
        return data
        

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
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'username',
            'profile_image',
            'post',
            'parent',
            'content',
            'created_at',
            'updated_at',
            'replies',
        ]
        read_only_fields = ['user', 'post', 'created_at','updated_at', 'replies']

    def get_profile_image(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.profile_image:
            return profile.profile_image.url
        return None
    def get_replies(self,obj):
        replies = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies, many=True, context=self.context).data


class SavedPostSerializer(serializers.ModelSerializer):
    post= PostSerializer(read_only=True)

    class Meta:

        model = SavedPost
        fields = [
            'id',
            'user',
            'post',
            'created_at',
        ]
        read_only_fields = ['user', 'post', 'created_at']
