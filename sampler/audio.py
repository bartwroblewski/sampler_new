import pytube

from django.conf import settings

def download(watch_url):
    yt = pytube.YouTube(watch_url)
    all_streams = yt.streams.all()
    audio_mp4_stream_itag = [
        stream.itag \
        for stream in all_streams \
        if stream.mime_type == 'audio/mp4' \
        ][0]
    audio_stream = yt.streams.get_by_itag(audio_mp4_stream_itag)
    download_path = settings.MEDIA_ROOT
    downloaded_file_path = audio_stream.download(download_path)
    return downloaded_file_path

        
