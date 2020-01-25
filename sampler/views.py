from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse, JsonResponse

from .models import Sample
from .utils import in_memory_zip
from sampler import client

def index(request):
    return render(request, 'sampler/index.html')

def get_videos(request):
    keyword = request.GET.get('keyword')
    videos = client.get_videos(keyword)
    response = {
        'videos': videos,
    }
    return JsonResponse(response)
    
def download(request):
    watch_url = request.GET.get('watch_url')
    sample = Sample.objects.get(id=1706)
    #~ sample.download(watch_url)

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
    
    z = in_memory_zip(sample_paths).getvalue()
    
    response = HttpResponse(z, content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="samples.zip"'
    return response
    
