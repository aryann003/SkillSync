from django.urls import path
from .views import *

urlpatterns = [
    path('post/<int:id>/', report_post),
    path('comment/<int:id>/', report_comment),
    path('my/', my_reports),
    path('all/', all_reports),
    path('pending/', pending_reports),
    path('status/<int:id>/', update_report_status),
]