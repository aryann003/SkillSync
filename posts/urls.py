from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

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
    path('feed/',activity_feed),

    path('comment/update/<int:id>/',edit_comment),
    path('comment/delete/<int:id>/',delete_comment),
    path('trending/', trending_posts),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)