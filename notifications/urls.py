from django.urls import path
from .views import *

urlpatterns = [
    path('', my_notifications),
    path('unread/',unread_notifications),
    path('read/<int:id>/',mark_as_read),
    path('read/all/',mark_all_as_read),
    path('count/',notification_count),
    path('delete/<int:id>/', delete_notification),
]