from django.urls import path
from .views import *

urlpatterns = [
    path('create/', create_community),
    path('', all_communities),
    path('<int:id>/', community_detail),

    path('join/<int:id>/', join_community),
    path('leave/<int:id>/', leave_community),
    path('members/<int:id>/', community_members),

    path('<int:id>/posts/create/', create_community_post),
    path('<int:id>/posts/', community_posts),
    path('posts/delete/<int:id>/', delete_community_post),
]