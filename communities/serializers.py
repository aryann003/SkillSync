from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Community, CommunityMember, CommunityPost


class UserBasicSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email'
        ]



class CommunitySerializer(serializers.ModelSerializer):

    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = '__all__'

        read_only_fields = [
            'created_at',
            'created_by'
        ]

    def get_member_count(self, obj):
        return CommunityMember.objects.filter(
            community=obj
        ).count()
    

class CommunityMemberSerializer(serializers.ModelSerializer):

    user = UserBasicSerializer(read_only = True)

    class Meta:
        model = CommunityMember
        fields = '__all__'
        read_only_fields = [
            'joined_at',
            'user'
        ]

class CommunityPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = CommunityPost
        fields = '__all__'
        read_only_fields = [
            'user',
            'community',
            'created_at',
            'updated_at'
        ]