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

def cart_add(request, sample_id):
    sample = Sample.objects.get(id=sample_id)
    cart = Cart(request)
    cart.add_sample(sample)
    return HttpResponse('{} was added to cart'.format(str(sample_id)))
    
def cart_remove(request, sample_id):
    sample = Sample.objects.get(id=sample_id)
    cart = Cart(request)
    cart.remove_sample(sample)
    return HttpResponse('{} was removed from cart'.format(str(sample_id)))
    
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
        'downloaded_sample_id': sample.id,
    }
    return JsonResponse(response)
    
def slc(request):
    sample_id = request.GET.get('sample_id')
    num_of_slices = int(request.GET.get('num_of_slices'))
    slice_duration = int(request.GET.get('slice_duration'))
    
    sample = Sample.objects.get(id=sample_id)
    slices = sample.slc(num_of_slices, slice_duration)
    response = {
        'slices_ids': [x.id for x in slices],
    }
    return JsonResponse(response)
