from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('uploader.urls', namespace='uploader')),
    path('uploader/', include('uploader.urls')),
    path('admin/', admin.site.urls),
]
