from django.urls import path
from .views import *

urlpatterns = [

    path('create/', create_post),

    path('', all_posts),

    path('my/', my_posts),

    path('update/<int:id>/', update_post),

    path('delete/<int:id>/', delete_post),

    path('like/<int:id>/', like_post),

    path('unlike/<int:id>/', unlike_post),

    path('comment/<int:id>/', add_comment),

    path('comments/<int:id>/', post_comments),

    path('save/<int:id>/', save_post),
    path('unsave/<int:id>/', unsave_post),
    path('saved/', saved_posts),
]