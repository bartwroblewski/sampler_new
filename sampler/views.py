from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse, JsonResponse

from .models import Sample
from .cart import Cart
from sampler import (
    client,
    #~ audio,
)
from .utils import zip_files

def index(request):
    return render(request, 'sampler/index.html')

def cart_add(request):
    sample_id = request.GET.get('sample_id')
    sample = Sample.objects.get(id=sample_id)
    cart = Cart(request)
    confirmation = cart.add_sample(sample)
    return HttpResponse(confirmation)
    
def cart_remove(request):
    sample_id = request.GET.get('sample_id')
    sample = Sample.objects.get(id=sample_id)
    cart = Cart(request)
    confirmation = cart.remove_sample(sample)
    return HttpResponse(confirmation)
    
def cart_show(request):
    cart = Cart(request)
    response = {
        'cart': cart.cart,
    }
    return JsonResponse(response)
    
def get_videos(request):
    keyword = request.GET.get('keyword')
    videos = client.get_videos(keyword)
    response = {
        'videos': videos,
    }
    return JsonResponse(response)
    
def download(request):
    watch_url = request.GET.get('watch_url')
    sample = Sample()
    sample.download(watch_url)
    
    samples = sample.raw()
    abs_max = max([abs(s) for s in samples])
    
    response = {
        'downloaded_sample_url': sample.audio.url,
        'downloaded_sample_id': sample.id,
        'downloaded_sample_samples': samples,
        'downloaded_sample_abs_max': abs_max,
    }
    return JsonResponse(response)
    
def slc(request):
    sample_id = request.GET.get('sample_id')
    start_sec = float(request.GET.get('start_sec'))
    end_sec = float(request.GET.get('end_sec'))
    print('SAMPLE ID', sample_id)
    sample = Sample.objects.get(id=sample_id)
    slice_obj = sample.slc(start_sec, end_sec)
    response = {
        'slice_url': slice_obj.audio.url,
        'slice_id': slice_obj.id,
    }
    return JsonResponse(response)
    
    
def serve(request):
    '''Returns a zip file containing the requested samples'''
    sample_ids = request.GET.get('sample_ids').split(',')
    sample_paths = [
        s.audio.path
        for s in Sample.objects.filter(id__in=sample_ids)
    ]
    
    z = zip_files(sample_paths, settings.MEDIA_ROOT)
    
    response = HttpResponse(z.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="samples.zip"'
    
    return response
    
def get_samples(request):
    sample_id = request.GET.get('sample_id')
    print(sample_id)
    sample = Sample.objects.get(id=sample_id)
    samples = sample.raw
    response = {
        'samples': samples,
        'abs_max': max([abs(s) for s in samples])
    }
    return JsonResponse(response)
    
def generate(request):
    return render(request, 'sampler/generate.html')
    
def normalize(value, mn, mx):

    if value != 0:
        return (value - mn) / (mx - mn)
    else:
        return 0
        
def export_test(request):
    return render(request, 'sampler/export_test.html')
    
def sampler_test(request):
    return render(request, 'sampler/sampler_test.html')
