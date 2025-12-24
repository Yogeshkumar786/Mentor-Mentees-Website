from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('change-password', views.change_password, name='change_password'),
    path('register', views.register, name='register'),
    path('me', views.get_user_role, name='get_user_role'),
]
