from django.urls import path
from django.conf import settings
#~ from django.conf.urls.static import static

from . import views

app_name='sampler'
urlpatterns = [
    path('', views.index, name='index'),
    path('get_videos', views.get_videos, name='get_videos'),
    path('download', views.download, name='download'),
    path('slc', views.slc, name='slc'),
    path('serve', views.serve, name='serve'),
] #+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
