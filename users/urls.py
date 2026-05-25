from django.urls import path
from .views import test, register,profile, update_profile


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
]