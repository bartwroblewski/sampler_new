import os
import math

import pytube
import pydub

from django.db import models
from django.core.files import File
from django.conf import settings

from sampler import audio

class Sample(models.Model):
    audio = models.FileField(upload_to='samples')
    
    def download(self, watch_url):
        filepath = audio.download(watch_url)
        filename = os.path.basename(filepath)
        with open(filepath, 'rb') as f:
            self.audio.save(filename, f)
        os.remove(filepath)
        
    def slc(self, start_sec, end_sec):
        pydub.AudioSegment.converter = settings.CONVERTER_PATH
        song = pydub.AudioSegment.from_file(self.audio.path)
        
        start_milisec = round(start_sec * 1000)
        end_milisec = round(end_sec * 1000)
        
        slice_name = '{}_slice_{}_to_{}.wav'.format(
            os.path.basename(self.audio.name),
            str(round(start_milisec)),
            str(round(end_milisec)),
        )
        slice_path = os.path.join(settings.MEDIA_ROOT, slice_name)
        slice_mp3 = song[start_milisec:end_milisec].export(
            slice_path,
            format='wav',
            #~ codec='mp3',
        )
        
        slice_obj = Sample()
        with open(slice_path, 'rb') as f:
            slice_obj.audio.save(slice_name, f)
        os.remove(slice_path)  
        return slice_obj
    
    def raw(self):
        pydub.AudioSegment.converter = settings.CONVERTER_PATH
        song = pydub.AudioSegment.from_file(self.audio.path)
        samples = song.get_array_of_samples().tolist()[::1000]
        return samples
    #~ def slc(self, num_of_slices, slice_duration):
        #~ slices = []
        #~ def get_samples(song):
            #~ """Returns a list of samples"""
            #~ container_duration = len(song) / num_of_slices
            #~ marker = 0
            #~ samples = []

            #~ for _ in range(num_of_slices):
                #~ container = {
                    #~ 'start': marker,
                    #~ 'end': marker + container_duration
                #~ }
                #~ sample_start = uniform(container['start'], container['end'] - slice_duration)
                #~ sample_end = sample_start + slice_duration
                #~ sample = {
                    #~ 'audio': song[sample_start:sample_end],
                    #~ 'start': str(int(math.floor(sample_start / 1000))), # convert miliseconds to seconds for displaying on front end
                    #~ 'end': str(int(math.floor(sample_end / 1000))), 
                #~ }
                #~ samples.append(sample)
                #~ marker += container_duration

            #~ return samples

        #~ pydub.AudioSegment.converter = settings.CONVERTER_PATH
        #~ song = pydub.AudioSegment.from_file(self.audio.path, "mp4")
        #~ samples = get_samples(song=song)
        #~ for index, sample in enumerate(samples):
            #~ filepath = os.path.join(settings.MEDIA_ROOT, str(index))
            #~ mp3_file = sample['audio'].export(
                #~ filepath,
                #~ format='mp3',
                #~ codec='mp3',
            #~ )
            #~ slc = Sample()
            #~ with open(filepath, 'rb') as f:
                #~ field_file = File(f)
                #~ self.audio = field_file
                #~ self.save() # self.audio.save('sample_{}'.format(self.id), f, save=True)
                #~ slices.append(slc)
        #~ return slices   
        
    def to_dict(self):
        d = {
            'id': self.id,
            'url': self.audio.url,
        }
        return d
        
