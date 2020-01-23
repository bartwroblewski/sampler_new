export {Sampler}
import {random_rgba} from './colors.js'

class Sampler {
    constructor(el) {
        this.render(el)
        SWAPPER.register(this)
    }
    
    render(el) {
        this.el = el
        this.el.className = 'sampler'
        //~ this.el.style.width = '800px'
        //~ this.el.style.height = '400px'
        //~ this.el.style.backgroundColor = 'yellow'    
        //~ this.el.style.display = 'flex'
        
        
        let waveform_el = document.createElement('div')
        let settings_el = document.createElement('div')
        let pads_el = document.createElement('div')
        
        this.el.appendChild(waveform_el)
        this.el.appendChild(settings_el)
        this.el.appendChild(pads_el)

        this.waveform = new Waveform(waveform_el)
        this.settings = new Settings(settings_el)
        this.pads = new Pads(pads_el, 16)        
        
        this.settings.sampleIds = this.getSampleIds
    }
    
    getSampleIds = () => {
        return this.pads.nonEmpty().map(pad => pad.audio.id)
    }
}

class Waveform {
    constructor(el) {
        this.render(el)
        this.renderAudio()
        this.rects = []
        this.sample_data = null
    }
    
    render(el) {
        this.el = el
        this.el.className = 'waveform'
        
        this.canvas = document.createElement('canvas')
        this.el.appendChild(this.canvas)
        
        // fit to container (sampler)
        //~ this.canvas.style.width = '100%'
        //~ this.canvas.style.height = '25%'
        this.canvas.width = this.el.offsetWidth
        this.canvas.height = this.el.offsetHeight
      
        //~ this.canvas.style.border = '1px solid black'
        this.canvas.oncontextmenu = () => false
        
        this.box = this.canvas.getBoundingClientRect()
        this.ctx = this.canvas.getContext('2d')
        
        this.font_size = this.canvas.height * 15/100
        this.rect_color = random_rgba(0.3)
        this.message_color = random_rgba()
        
        this.ctx.font = `${this.font_size}px Georgia`
        this.ctx.fillStyle = this.rect_color
        this.ctx.fillStyle = 'rgb(255, 255, 255)' 
        
        // display messages in the center of the canvas
        this.ctx.textAlign = 'center'
        
        this.canvas.addEventListener('mousedown', this.mouseDown)
        this.canvas.addEventListener('mousemove', this.mouseMove)
        this.canvas.addEventListener('mouseup', this.mouseUp)
        this.canvas.addEventListener('dblclick', this.dblClick)
        this.canvas.addEventListener('dragover', this.dragOver)
        this.canvas.addEventListener('drop', this.drop)       
        
        this.displayMessage('Drag thumbnails here or use the custom URL input')   

    }
    
    dragOver(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }
    
    drop = e => {
        e.preventDefault()
        let watch_url = e.dataTransfer.getData('text/plain')
        let event = new CustomEvent(
            'waveform_drop',
            {detail: watch_url},
        )
        this.canvas.dispatchEvent(event)
    }
    
    renderAudio() {
        this.audio = document.createElement('audio')
        this.audio.preload = 'metadata'
        this.audio.controls = false
        this.audio.volume = 0 // MUTE
        this.canvas.appendChild(this.audio)
    }
    
    loadAudio(src) {
        this.audio.src = src
        this.reset()
    }
    
    reset() {
        // clear previous and show wait message
        //this.audio.src = ''
        this.rects = []
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    
    drawWave() {             
        let samples = this.sample_data.downloaded_sample_samples
        let abs_max = this.sample_data.downloaded_sample_abs_max
    
        this.ctx.save()
        this.ctx.translate(0, this.canvas.height / 2) // display waveform in the middle Y of canvas
        
        // set up scaling
        let y_zoom = (this.canvas.height / 100) * 55
        let x_scale = this.canvas.width / samples.length 
        let y_scale = (this.canvas.height - y_zoom) / abs_max
           
        // start drawing the waveform
        this.ctx.moveTo(0, 0)
        this.ctx.beginPath()
        samples.forEach((sample, index) => {
            this.ctx.lineTo(index * x_scale, sample * y_scale)
        })
        this.ctx.stroke()
        
        // translate back to original height so that
        // rects can be drawn properly
        this.ctx.restore()
    
        this.ctx.fillStyle = this.rect_color
    }
    
    cursor_x(e) {
        // real canvas cursor position
        return e.clientX - this.box.left 
    }
    
    xToSec(x) {
        return  (x / this.box.width) * this.audio.duration
    }
      
    mouseDown = e => {
        if (e.button === 2) {
                console.log('removing rect')
                this.rects = this.rects.filter(rect => !rect.contains_x(this.cursor_x(e)))
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                this.drawWave()
                this.drawAllRects()
        }  
        
        if (e.button === 0) {            
            this.audio.currentTime = this.xToSec(this.cursor_x(e))
            this.audio.play()
            
            console.log('creating new rect')
            this.drag = true
            if (this.drag && !this.move) {
                this.rect = new Rect()
                this.rect.x = this.cursor_x(e)
                this.rect.y = 0
                this.rect.w = 1 // marker-like
                this.rect.h = this.canvas.height
                this.drawRect(this.rect)
            }
            
            if (this.drag && this.move) {
                this.rect = this.rects.find(rect => rect.contains_x(this.cursor_x(e)))
            } 
        }
    }
    
    mouseMove = e => {
        if (!this.drag) {
            if (this.rects.some(rect => rect.contains_x(this.cursor_x(e)))) {
                    document.body.style.cursor = 'move'
                    this.move = true
                } else {
                    document.body.style.cursor = 'default'
                    this.move = false
                }      
        }
        
        if (this.drag && !this.move) {
            console.log('resizing rect')
            // clear entire canvas

            this.ctx.clearRect(0, 0, this.box.width, this.box.height)
            
            //~ // // redraw background image (waveform)
            // let image = new Image(800, 150)
            // image.src = 'Sticky.PNG'
            // this.ctx.drawImage(image, 0, 0)
            this.drawWave()
            
            
            //redraw all stored rects
            this.drawAllRects()
            
            // resize current rect
            this.rect.w = this.cursor_x(e) - this.rect.x;
            this.drawRect(this.rect)
        }
        
        if (this.drag && this.move) {
            console.log('moving rect')
            this.ctx.clearRect(0, 0, this.box.width, this.box.height)  
            
            this.drawWave()
            
            // avoid drawing same rect again
            this.drawAllRects(this.rect)
            
            // move
            this.rect.x = this.rect.x + (this.cursor_x(e) - this.rect.x) 
            
            // prevent dragging the rect past waveform end
            let past = (this.rect.x + this.rect.w) - this.canvas.width
            if (past > 0) {
                this.rect.x -= past
            }
            
            this.drawRect(this.rect)
        }
    }
    
    mouseUp = e => {
        if (e.button === 0) {
            
            this.audio.pause()
            
            this.drag = false
             
            // store rects to redraw them on mousemove
            if (!this.move) {
                this.rects.push(this.rect)
            }
            
            // remove marker-like rect
            //~ if (this.rect.w === 1) {
                //~ this.rects = this.rects.filter(rect => rect !== this.rect)
                //~ this.drawAllRects()
            //~ }
        }
    }
    
    dblClick = async e => {
        // if more than one region contains clicked x, the one on top (last created)
        // will be exported
        let clicked_rect = this.rects.reverse().find(rect => rect.contains_x(this.cursor_x(e)))
        let event = new CustomEvent(
            'region_dblclick',
            {detail: this.rectToAudio(clicked_rect)}
        )
        this.canvas.dispatchEvent(event)
    }
    
    rectToAudio(rect) {
        return {
            'start_sec': this.xToSec(rect.x),
            'end_sec': this.xToSec(rect.x + rect.w),
        }
    }

    drawRect(rect) {
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
    
    drawAllRects(exclude_rect) {
        this.rects.forEach(rect => {
            if (rect !== exclude_rect) this.drawRect(rect)
        }) 
    }    
        
    displayMessage(message) {
        let x = this.canvas.width / 2
        let y = this.canvas.height / 2
        this.ctx.fillStyle = this.message_color
        this.ctx.fillText(message, x, y)
    }  
}

class Rect {
    constructor() {
        this.x = 0
        this.y = 0
        this.w = 0
        this.h = 0
    }
    
    contains_x = x => 
        (x >= this.x && x <= this.x + this.w) || // rect drawn left to right (has positive width)
        (x <= this.x && x >= this.x + this.w)    // rect drawn right to left (has negative width)
        ? true : false  
}

class Pads {
    constructor (el, n_pads) {
        this.pads = [] // array of Pad objects
        this.render(el, n_pads)          
    }
    
    render(el, n_pads) {
        this.el = el
        this.el.className = 'pads'
        for (let i = 1; i < n_pads + 1; i++) {
            let pad = new Pad(create_UUID())
            this.pads.push(pad)
            this.el.appendChild(pad.el)
       }
    }   
    
    update() {
        // update objects list order to match DOM order
        let ids = Array.from(this.el.children).map(el => el.id)
        let sorted = this.pads.map(pad => this.pads[ids.indexOf(pad.el.id)])
        this.pads = sorted
    }
    
    nonEmpty() {
        return this.pads.filter(pad => !pad.empty())
    }
    
    empty () {
        return this.pads.filter(pad => pad.empty())
    }
    
    firstEmpty() {
        // get first pad without audio loaded
        return this.empty()[0]
    }
}

class Pad {
    constructor(element_id) {
        this.render(element_id)                  
    }
    
    render(element_id) {
        this.el = document.createElement('div')
        this.el.id = element_id
        //~ this.el.textContent = this.el.id
        
        this.audio = document.createElement('audio')               
        this.audio.volume = 0 // MUTE
        
        this.el.appendChild(this.audio)
        
        this.el.classList.add('pad', 'empty')
                      
        this.refresh()
        this.el.style.borderColor = random_rgba()
        
        this.el.oncontextmenu = () => false
        this.el.addEventListener('mouseup', this.mouseUp)
        this.el.addEventListener('dragstart', this.dragStart)
        this.el.addEventListener('dragover', this.dragOver)
        this.el.addEventListener('drop', this.drop)
        
    }
    
    empty = () => this.el.classList.contains('empty') ? true : false
    
    color = () => this.empty() ? 'black' : ''
    
    refresh() {
        this.el.style.backgroundColor = this.color()
        this.el.draggable = !this.empty()
    }
                    
    loadAudio(src) {
        this.audio.src = src
        this.el.classList.remove('empty')
        this.refresh()
    }
    
    removeAudio() {
        this.audio.pause()
        this.audio.src = ''
        this.audio.load()
        this.el.classList.add('empty')
        this.refresh()
    }
    
    mouseUp = e => {
        if (e.button === 0) {
            this.audio.play() //loadAudio('bensound-summer.mp3')
        }
        if (e.button === 2) {
            this.removeAudio()
        }
    }
    
    dragStart = e => {
        e.dataTransfer.dropEffect = 'move'
        e.dataTransfer.setData('text/plain', e.target.id)
    }
    
    dragOver = e => {
        e.preventDefault()
        //e.dataTransfer.dropEffect = 'move'
    }
    
    drop = e => {
        e.preventDefault()
        let id = e.dataTransfer.getData('text/plain')
        let src_el = document.getElementById(id)
        console.log('src', src_el)
        console.log('target', e.target)
        this._swap(src_el, e.target)                    
    }
    
    get swap() {
        return this._swap
    }
    
    set swap(f) {
        // set by SWAPPER
        this._swap = f
    }
    
    loading() {
        let interval = setInterval(() => {
            if (!this.audio.src) {
                this.el.textContent = 'Loading...'
            } else {
                this.el.textContent = ''
                clearInterval(interval)
            }
        }, 0)   
    }
}                

class Settings {
    constructor(el) {
        this.render(el)
    }
        
    render(el) {
        this.el = el
        this.el.className = 'settings'
        
        //~ this.el.style.width = '100%'
        //~ this.el.style.height = '10%'
        //~ this.el.style.display = 'flex'
        //~ this.el.style.justifyContent = 'space-between'
        
        let serve_btn = document.createElement('button')
        serve_btn.textContent = 'Download current pads'
        this.el.appendChild(serve_btn)
        
        let url_input = document.createElement('input')
        url_input.type = 'text'
        url_input.placeholder = 'URL?'
        
        let load_btn = document.createElement('button')
        load_btn.type  = 'submit'
        load_btn.textContent = 'Load custom URL'
        
        this.url_form = document.createElement('form')
        this.url_form.appendChild(url_input)
        this.url_form.appendChild(load_btn)
        this.el.appendChild(this.url_form) 
        
        serve_btn.addEventListener('click', e => {
            let event = new CustomEvent(
                'serve_btn_click',
                {detail: this.sampleIds},
            )
            this.el.dispatchEvent(event)
        })
        
        this.url_form.addEventListener('submit', e => {
            e.preventDefault()
            let watch_url = url_input.value
            let event = new CustomEvent(
                'url_form_submit',
                {detail: watch_url},
            )
            this.url_form.dispatchEvent(event)
        })
        
    }
    
    set sampleIds(f) {
        this._sample_ids = f
    }
    
    get sampleIds() {
        return this._sample_ids()
    }
}

class Swapper {
        constructor() {
            this.samplers = []
        }
        
        register(sampler) {
            this.samplers.push(sampler)
            
            // set swap for each pad object
            sampler.pads.pads.forEach(pad => {
                pad.swap = this.swap.bind(this)
            })   
        }
                
        findObjectForEl(el) {
            let els = sampler => Array.from(sampler.pads.el.children)
            let parent_sampler = this.samplers.filter(sampler => els(sampler).includes(el))[0]
            let el_index = els(parent_sampler).indexOf(el)
            let pad_obj = parent_sampler.pads.pads[el_index]
            return { 
                'sampler': parent_sampler,
                'pad_obj': pad_obj,
            }
        }
        
        swap(src_el, target_el) {
            console.log('swapper is swapping elements:', src_el, target_el)
            let src_obj = this.findObjectForEl(src_el)
            let target_obj = this.findObjectForEl(target_el)
                
            // swap objects
            let src_idx = src_obj.sampler.pads.pads.indexOf(src_obj.pad_obj)
            let target_idx = target_obj.sampler.pads.pads.indexOf(target_obj.pad_obj)
            
            src_obj.sampler.pads.pads[src_idx] = target_obj.pad_obj   
            target_obj.sampler.pads.pads[target_idx] = src_obj.pad_obj              
            
            // swap DOM 
            let temp = document.createElement("div");
            src_el.parentNode.insertBefore(temp, src_el);

                // move src_el to right before obj2
            target_el.parentNode.insertBefore(src_el, target_el);

                // move obj2 to right before where src_el used to be
            temp.parentNode.insertBefore(target_el, temp);

                // remove temporary marker node
            temp.parentNode.removeChild(temp);
        }
        
        
    }
    
    
let SWAPPER = new Swapper()
    
function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
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
