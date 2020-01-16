import {Sampler} from './sampler.js'

let el = document.createElement('div')
document.body.appendChild(el) // IMPORTANT TO DO IT HERE!!!!
let sampler = new Sampler(el)


sampler.waveform.loadAudio('http://127.0.0.1:8000/media/samples/95023ba5-1bab-462f-9ddd-d8a8df452826Idiot_Test_-_90_fail.mp4')
