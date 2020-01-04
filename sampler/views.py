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
    }
    return JsonResponse(response)
    
def slc(request):
    sample_id = request.GET.get('sample_id')
    num_of_slices = int(request.GET.get('num_of_slices'))
    slice_duration = int(request.GET.get('slice_duration'))
    
    sample = Sample.objects.get(id=sample_id)
    slices = sample.slc(num_of_slices, slice_duration)
    response = {
        'slices': [s.to_dict() for s in slices],
    }
    print(response)
    return JsonResponse(response)
