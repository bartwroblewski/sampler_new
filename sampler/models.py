import os
import datetime

from django.db import models
from django.utils import timezone

from sampler import audio

class Sample(models.Model):
    audio = models.FileField(upload_to='samples')
    created = models.DateTimeField(auto_now_add=True)
    
    def download(self, watch_url):
        filepath = audio.download_audio(watch_url)
        filename = os.path.basename(filepath)
        with open(filepath, 'rb') as f:
            self.audio.save(filename, f)
        os.remove(filepath)
        
    def slice_(self, start_sec, end_sec):
        _slice = audio.slice_audio(
            self.audio.name,
            self.audio.path,
            start_sec, 
            end_sec
        )
        slice_obj = Sample()
        with open(_slice.path, 'rb') as f:
            slice_obj.audio.save(_slice.name, f)
        os.remove(_slice.path)  
        return slice_obj
    
    def as_samples(self):
        samples = audio.get_samples(self.audio.path)
        return samples
        
    def remove_if_old(self, threshold):
        '''Remove old object from db 
        and its associated file from disk.
        ''' 
        timedelta = timezone.now() - self.created
        timedelta_in_hours = timedelta.total_seconds() / 3600
        if timedelta_in_hours > threshold:
            os.remove(self.audio.path)
            self.delete()
            
    def __str__(self):
        return '{}, {}'.format(self.audio.name, self.created)
