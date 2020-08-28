from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'insta'

urlpatterns = [
    path('', views.index, name='index'),
    path('<int:is_priv>/', views.index, name='index'),
    path('follow/<int:user_id>/<int:post_id>/', views.follow, name='follow'),
    path('unfollow/<int:user_id>/<int:post_id>/', views.unfollow, name='unfollow'),
    path('upload/', views.upload),
    path('comment_to/<int:post_id>/', views.comment_to, name="comment_to"),
    path('to/', views.to, name="to"),
    path('search/', views.index),
    path('search/<str:query>/', views.searchfor, name="search"),
    path('predict/<int:post_id>/', views.predict, name="predict"),
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name="logout"),
    path('register/', views.register, name="register"),
    path('view/<int:post_id>/', views.view, name="view"),
    path('like/<int:post_id>/', views.like, name='like'),
    path('unlike/<int:post_id>/', views.unlike, name='unlike'),
    path('user/', views.selfPage, name='userSelf'),
    path('user/<str:name>/', views.userPage, name='user'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#Most of these don't need an external url- how to clean this up?