from django.urls import path
from .views import *

urlpatterns = [

    path('create/', create_post),

    path('', all_posts),

    path('my/', my_posts),

    path('update/<int:id>/', update_post),

    path('delete/<int:id>/', delete_post),
]