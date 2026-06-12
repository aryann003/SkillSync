from django.urls import path
from .views import*


from rest_framework_simplejwt.views import(
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path('test/',test),
    path('register/',register),
    path('profile/',profile),
    path('profile/update/',update_profile),


    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('search/users/',search_users),
    path('recommend/users/',recommended_users),
    path('dashboard/', dashboard),
    path('search/', global_search),
]