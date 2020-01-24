


#~ import pytube
from __future__ import unicode_literals
import os
import uuid

import youtube_dl

from django.conf import settings



#~ def download(watch_url):
    #~ yt = pytube.YouTube(watch_url)
    #~ all_streams = yt.streams.all()
    #~ audio_mp4_stream_itag = [
        #~ stream.itag \
        #~ for stream in all_streams \
        #~ if stream.mime_type == 'audio/mp4' \
        #~ ][0]
    #~ audio_stream = yt.streams.get_by_itag(audio_mp4_stream_itag)
    #~ download_folder = os.path.join(settings.MEDIA_ROOT, 'samples')
    
    #~ downloaded_filepath = audio_stream.download(
        #~ output_path=download_folder,
        #~ filename_prefix=str(uuid.uuid4()),
    #~ )
    
    #~ return downloaded_filepath

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
        'test.mp3',
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
