from __future__ import unicode_literals
import os
import uuid

import youtube_dl

from django.conf import settings

def download(watch_url):
    class MyLogger(object):
        def debug(self, msg):
            pass

        def warning(self, msg):
            pass

        def error(self, msg):
            print(msg)


    def my_hook(d):
        if d['status'] == 'finished':
            print('Done downloading, now converting ...')

    
    filepath = os.path.join(
        settings.MEDIA_ROOT,
        'samples',
        str(uuid.uuid4()) + '.mp3',
    )
    
    ydl_opts = {
        'outtmpl': str(filepath),
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'logger': MyLogger(),
        'progress_hooks': [my_hook],
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([watch_url])
        
    return filepath
