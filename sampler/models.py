import pytube

from django.db import models
from django.core.files import File
from django.conf import settings

class Slice(models.Model):
    file = models.FileField()
    sample = models.ForeignKey('Sample', on_delete=models.CASCADE)

class Sample(models.Model):
    file = models.FileField()
    
    def download(self, watch_url):
        yt = pytube.YouTube(watch_url)
        all_streams = yt.streams.all()
        audio_mp4_stream_itag = [
            stream.itag \
            for stream in all_streams \
            if stream.mime_type == 'audio/mp4' \
            ][0]
        audio_stream = yt.streams.get_by_itag(audio_mp4_stream_itag)
        download_path = settings.MEDIA_ROOT
        filepath = audio_stream.download(download_path)

        with open(filepath, 'rb') as f:
            field_file = File(f)
            self.file = field_file
            self.save()
        
    def slice(num_of_slices, slice_duration):
        pass
        
    
        
        
