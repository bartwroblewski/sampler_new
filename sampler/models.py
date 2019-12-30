import os
import math
from random import uniform

import pytube
import pydub

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
        
    def slc(self, num_of_slices, slice_duration):
        slices = []
        def get_samples(song):
            """Returns a list of samples"""
            container_duration = len(song) / num_of_slices
            marker = 0
            samples = []

            for _ in range(num_of_slices):
                container = {
                    'start': marker,
                    'end': marker + container_duration
                }
                sample_start = uniform(container['start'], container['end'] - slice_duration)
                sample_end = sample_start + slice_duration
                sample = {
                    'audio': song[sample_start:sample_end],
                    'start': str(int(math.floor(sample_start / 1000))), # convert miliseconds to seconds for displaying on front end
                    'end': str(int(math.floor(sample_end / 1000))), 
                }
                samples.append(sample)
                marker += container_duration

            return samples

        pydub.AudioSegment.converter = settings.CONVERTER_PATH
        song = pydub.AudioSegment.from_file(self.file.path, "mp4")
        samples = get_samples(song=song)
        for index, sample in enumerate(samples):
            filepath = os.path.join(settings.MEDIA_ROOT, str(index))
            mp3_file = sample['audio'].export(
                filepath,
                format='mp3',
                codec='mp3',
            )
            slc = Slice()
            slc.sample = self
            with open(filepath, 'rb') as f:
                field_file = File(f)
                slc.file = field_file
                slc.save()
                slices.append(slc)
        return slices
     
        
        
