from django.urls import path
from .views import *

urlpatterns = [
    path('follow/<int:id>/', follow_user),
    path('unfollow/<int:id>/', unfollow_user),
    path('followers/<int:id>/', followers_list),
    path('following/<int:id>/', following_list),
]