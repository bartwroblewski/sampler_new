# YouTube Chop Chop

## About

An app to sample audio off YouTube videos.

## Usage

Live version [here](http://134.209.236.65/).

1. Search for a YouTube video.
2. Add a new sampler and drag the video to it.
3. Use the sampler's waveform to slice the audio. 
4. Double click any slice to place it in a sampler pad. Click on pad to play the slice.
5. Download the slices as .wav files. Next you can load the samples to your software/hardware sampler of choice for further manipulation.

## How does it work? 

Video search is done via YouTube API

Audio is downloaded with pytube and chopped with pydub.

Chopped samples are stored on app's server and available for download.

## Technology stack

Backend: Python & Django

Frontend: vanilla JavaScript.

## Screenshot:
![Alt text](/screenshots/app.png?raw=true)
