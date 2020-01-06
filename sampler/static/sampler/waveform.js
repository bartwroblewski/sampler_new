export {Waveform, WaveformRegion}

class WaveformRegion {
	constructor(waveform, start_x) {
		this.waveform = waveform
		this.start_x = start_x	
		this.render()
		this.registerListeners()   
		
		this.waveform.regions.push(this) 
		
		this.created = new CustomEvent('region_created', {detail: this})
		this.waveform.el.dispatchEvent(this.created)
	}
	
	render() {
		this.el = document.createElement('div')
		this.el.className = 'waveform_region'
		this.el.style.height = this.waveform.el.offsetHeight + 'px'
		this.el.style.width = '1px'
		this.el.style.position = 'absolute'
		this.el.style.left = this.start_x +'px'
		this.el.style.backgroundColor = getRandomRGB()
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
		// if region is generated randomly, its ending point may be
		// past waveform's ending point - in such case, try again 
		let waveform_end_x = this.waveform.el.offsetLeft + this.waveform.el.offsetWidth
		if (end_x > this.waveform_end_x) {
			this.resize(end_x - 1)
		}
			
			
		let width = (end_x - this.start_x) 
		if (width < 0) {
			console.log('width below 0, cannot resize')
		}
		this.el.style.width = width + 'px'
		this.end_x = end_x
	}    
	
	remove() {
		this.waveform.regions = this.waveform.regions.filter(region => this.el !== region.el)
		this.waveform.el.removeChild(this.el)
	}
	
	registerListeners() {
		this.el.addEventListener('click', e => {
			this.handleRegionClick(e)
		})
	}
	
	handleRegionClick(e) {
		//~ console.log('exporting region. The bounds are', this.audio_bounds())
	}
	
}

class Waveform {
    constructor(container_selector) {
        this.render(container_selector)
        this.renderAudio()
        this.rects = []
    }
    
    render(container_selector) {
        this.canvas = document.querySelector(container_selector)
        this.canvas.width = this.canvas.parentNode.offsetWidth
        this.canvas.height = 150
        this.canvas.style.border = '1px solid black'
        this.ctx = this.canvas.getContext('2d')
        
        // rect color
        this.ctx.fillStyle = 'rgba(200, 0, 0, 0.3)'
        
        this.canvas.addEventListener('mousedown', this.mouseDown)
        this.canvas.addEventListener('mousemove', this.mouseMove)
        this.canvas.addEventListener('mouseup', this.mouseUp)
    }
    
    renderAudio() {
        this.audio = document.createElement('audio')
        this.audio.controls = true
        document.body.appendChild(this.audio)
    }
    
    loadAudio(audio_url) {
        this.audio.src = audio_url
    }
    
    mouseDown = e => {
        this.drag = true
        this.rect = {}
        this.rect.x = e.clientX - this.canvas.offsetLeft
        this.rect.y = 0
        this.rect.w = 1 // marker-like
        this.rect.h = this.canvas.height
        this.drawRect(this.rect)
    }
    
    mouseMove = e => {
        if (this.drag) {
            // clear entire canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            
            //redraw all stored rects
            this.drawAllRects()
            
            // resize current rect
            this.rect.w = (e.clientX - this.canvas.offsetLeft) - this.rect.x;
            this.drawRect(this.rect)
        }
    }
    
    mouseUp = e => {
        this.drag = false
        
        // store rects to redraw them on mousemove
        this.rects.push(this.rect)
    }

    drawRect(rect) {
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
    
    drawAllRects() {
        this.rects.forEach(rect => {
            this.drawRect(rect)
        })
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRGB() {
	let randint = getRandomInt(10, 255)
	return `rgba(${randint}, 0, 0, 0.5)`
}
