export {Waveform, WaveformRegion}

class WaveformRegion {
	constructor(waveform, start_x) {
		this.waveform = waveform
		this.start_x = start_x
		this.render()
		this.registerListeners()    
	}
	
	render() {
		this.el = document.createElement('div')
		this.el.className = 'waveform_region'
		this.el.style.height = this.waveform.el.offsetHeight + 'px'
		this.el.style.width = '1px'
		this.el.style.position = 'absolute'
		this.el.style.left = this.start_x +'px'
		this.el.style.backgroundColor = 'black'
		this.waveform.el.appendChild(this.el)
	}
	
	x_to_sec(x) {
		// convert region start and end to seconds in parent waveform's audio
		return ((x - this.waveform.el.offsetLeft) / this.waveform.el.offsetWidth) * this.waveform.audio.duration
	}
	
	audio_bounds() {                     
		return {
			'start_milisec': this.x_to_sec(this.start_x) * 1000,
			'end_milisec': this.x_to_sec(this.end_x) * 1000,
		}
	}
	
	resize(end_x) {
		let width = (end_x - this.start_x) 
		if (width < 0) {
			console.log('width below 0, cannot resize')
		}
		this.el.style.width = width + 'px'
		this.end_x = end_x
	}    
	
	registerListeners() {
		this.el.addEventListener('click', e => {
			this.handleRegionClick(e)
		})
	}
	
	handleRegionClick(e) {
		console.log('exporting region. The bounds are', this.audio_bounds())
	}
	
}

class Waveform {
	constructor() {}
	
	loadAudio(audio_url) {
		this.audio = this.renderAudio(audio_url)
	}
	
	render(container_selector) {
		this.el = document.querySelector(container_selector)
		this.el.appendChild(this.audio)
		this.registerListeners()
	}
		
	renderAudio(audio_src) {
		let audio = document.createElement('audio')
		audio.preload = 'metadata'
		audio.src = audio_src
		audio.controls = false
		return audio
	}
	
	handleWaveformMousedownRight(e) {
		let region = new WaveformRegion(
			this, 
			e.clientX,
		)
		
		this.handleWaveformMousemove = function(e) {
			region.resize(e.clientX)
		}   
		
		e.target.addEventListener('mousemove', this.handleWaveformMousemove)   
	}
					
	handleWaveformMouseupRight(e) {
		e.target.removeEventListener('mousemove', this.handleWaveformMousemove)
	}

	registerListeners() {
		this.el.addEventListener('mousedown', e => {
			let clicked_x_location = (e.clientX-e.target.offsetLeft) / e.target.offsetWidth
			if (e.button === 0 ) {  
				let current_time = clicked_x_location * this.audio.duration
				this.audio.currentTime = current_time
				this.audio.play()
			} else if (e.button === 2) {
				this.handleWaveformMousedownRight(e)
			}
			
		})
		this.el.addEventListener('mouseup', e => {
			if (e.button === 0) {
				this.audio.pause()
			} else if (e.button === 2) {
				this.handleWaveformMouseupRight(e)
			}
		})
	}
	
	randomRegions(num_of_regions) {
		for (let i = 0; i < num_of_regions; i++) {
			
			let start = getRandomInt(1, 100)
			let region = new WaveformRegion(this, 310 + (i*10))
			region.resize(region.start_x + 7)
		}
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}