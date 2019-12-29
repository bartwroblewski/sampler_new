from django.urls import path
#~ from django.conf import settings
#~ from django.conf.urls.static import static

from . import views

app_name='sampler'
urlpatterns = [
    path('', views.index, name='index'),
    path('cart_add/sample<int:sample_id>', views.cart_add, name='cart_add'),
    path('cart_remove/sample<int:sample_id>', views.cart_remove, name='cart_remove'),
    path('cart_show', views.cart_show, name='cart_show'),
    path('get_videos', views.get_videos, name='get_videos'),
    path('download', views.download, name='download'),
] #+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
