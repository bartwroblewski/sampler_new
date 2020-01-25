from __future__ import unicode_literals
from collections import namedtuple
import os
import uuid

import youtube_dl
import pydub

from django.conf import settings

pydub.AudioSegment.converter = settings.CONVERTER_PATH

class DownloadLogger(object):
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)

    def my_hook(d):
        if d['status'] == 'finished':
            pass
            #~ print('Done downloading, now converting ...')
            
def download(watch_url):
    filepath = os.path.join(
        settings.MEDIA_ROOT,
        'samples',
        str(uuid.uuid4()) + '.mp3',
    )
    
    opts = {
        'outtmpl': str(filepath),
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        #~ 'logger': DownloadLogger(),
        #~ 'progress_hooks': [my_hook],
    }
    
    with youtube_dl.YoutubeDL(opts) as ydl:
        ydl.download([watch_url])
        
    return filepath

def slc(parent_sample_name, parent_sample_path, start_sec, end_sec):    
    start_milisec = round(start_sec * 1000)
    end_milisec = round(end_sec * 1000)
    
    _slice = namedtuple('Slice', 'name path')
    _slice.name = '{}_slice_{}_to_{}.wav'.format(
        os.path.basename(parent_sample_name),
        str(round(start_milisec)),
        str(round(end_milisec)),
    )
    _slice.path = os.path.join(settings.MEDIA_ROOT, _slice.name)
    
    audio_segment = pydub.AudioSegment.from_file(parent_sample_path)
    audio_segment[start_milisec:end_milisec].export(
        _slice.path,
        format='wav',
        #~ codec='mp3',
    )
    return _slice
    
def get_samples(filepath):
    audio_segment = pydub.AudioSegment.from_file(filepath)
    skip_every = 1000
    samples = audio_segment.get_array_of_samples().tolist()[::skip_every]
    return samples
