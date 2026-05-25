from rest_framework import serializers
from .models import Post, Like, Comment

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['user',
                            'created_at',
                            'updated_at'
                            ]
    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()
        

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like

        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

