from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Community, CommunityMember, CommunityPost


class UserBasicSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
        ]



class CommunitySerializer(serializers.ModelSerializer):

    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'created_at',
            'member_count',
            'is_member',
        ]

        read_only_fields = [
            'created_at',
            'created_by'
        ]

    def get_member_count(self, obj):
        return CommunityMember.objects.filter(
            community=obj
        ).count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return CommunityMember.objects.filter(
            user=request.user,
            community=obj
        ).exists()
    

class CommunityMemberSerializer(serializers.ModelSerializer):

    user = UserBasicSerializer(read_only = True)

    class Meta:
        model = CommunityMember
        fields = [
            'id',
            'user',
            'community',
            'joined_at',
        ]
        read_only_fields = [
            'joined_at',
            'user',
            'community',
        ]

class CommunityPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            'id',
            'user',
            'username',
            'profile_image',
            'community',
            'title',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'user',
            'community',
            'created_at',
            'updated_at'
        ]

    def get_profile_image(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.profile_image:
            return profile.profile_image.url
        return None
