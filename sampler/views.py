from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Sample
from .cart import Cart
from sampler import (
    client,
    #~ audio,
)

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
    response = {
        'downloaded_sample_url': sample.audio.url,
        'downloaded_sample_id': sample.id,
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
    
def test(request):
    sample = Sample.objects.first()
    samples = sample.raw().tolist()[::1000]
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
