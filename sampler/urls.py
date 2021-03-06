from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

app_name='sampler'
urlpatterns = [
    path('', views.index, name='index'),
    path('get_videos', views.get_videos, name='get_videos'),
    path('download_sample', views.download_sample, name='download_sample'),
    path('slice_sample', views.slice_sample, name='slice_sample'),
    path('serve_slices', views.serve_slices, name='serve_slices'),
]

# local urls
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
