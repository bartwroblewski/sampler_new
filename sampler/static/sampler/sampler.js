export {Waveform, Pads}

class Waveform {
    constructor(container_selector) {
        this.render(container_selector)
        this.renderAudio()
        this.rects = []
    }
    
    render(container_selector) {
        this.canvas = document.querySelector(container_selector)
        this.canvas.width = this.canvas.parentNode.offsetWidth
        this.canvas.height = 50
        this.canvas.style.border = '1px solid black'
        this.canvas.oncontextmenu = () => false
        
        this.box = this.canvas.getBoundingClientRect()
        this.ctx = this.canvas.getContext('2d')
        
        // rect color
        this.ctx.fillStyle = 'rgba(200, 0, 0, 0.3)'
        
        this.canvas.addEventListener('mousedown', this.mouseDown)
        this.canvas.addEventListener('mousemove', this.mouseMove)
        this.canvas.addEventListener('mouseup', this.mouseUp)
        this.canvas.addEventListener('dblclick', this.dblClick)
    }
    
    renderAudio() {
        this.audio = document.createElement('audio')
        this.audio.preload = 'metadata'
        this.audio.controls = true
        //~ this.audio.volume = 0
        //document.body.appendChild(this.audio)
    }
    
    loadAudio(src) {
        this.audio.src = src
    }
    
    cursor_x(e) {
        // real canvas cursor position
        return e.clientX - this.box.left 
    }
    
    mouseDown = e => {
        if (e.button === 2) {
                console.log('removing rect')
                this.rects = this.rects.filter(rect => !rect.contains_x(this.cursor_x(e)))
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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
            
            // // redraw background image (waveform)
            // let image = new Image(800, 150)
            // image.src = 'Sticky.PNG'
            // this.ctx.drawImage(image, 0, 0)
            
            //redraw all stored rects
            this.drawAllRects()
            
            // resize current rect
            this.rect.w = this.cursor_x(e) - this.rect.x;
            this.drawRect(this.rect)
        }
        
        if (this.drag && this.move) {
            console.log('moving rect')
            this.ctx.clearRect(0, 0, this.box.width, this.box.height)  
            
            // avoid drawing same rect again
            this.drawAllRects(this.rect)
            
            this.rect.x = this.rect.x + (this.cursor_x(e) - this.rect.x) 
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
        }
    }
    
    dblClick = e => {
        // if more than one region contains clicked x, the one on top (last created)
        // will be exported
        let clicked_rect = this.rects.reverse().find(rect => rect.contains_x(this.cursor_x(e)))
        let event = new CustomEvent(
            'region_export',
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
    
    xToSec(x) {
        return  (x / this.box.width) * this.audio.duration
    }  

    drawRect(rect) {
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
    
    drawAllRects(exclude_rect) {
        this.rects.forEach(rect => {
            if (rect !== exclude_rect) this.drawRect(rect)
        })
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
    constructor (container_selector, n_pads) {
        this.list = [] // array of Pad objects
        this.render(container_selector, n_pads)          
    }
    
    render(container_selector, n_pads) {
        this.el = document.querySelector(container_selector)
        for (let i = 1; i < n_pads + 1; i++) {
            let pad = new Pad(i)
            this.list.push(pad)
            this.el.appendChild(pad.el)
       }
    }   
    
    empty() {
        return this.list.filter(pad => pad.empty)
    }
    
    firstEmpty() {
        if (!this.empty()[0]) {
            alert('No free pads left!')
            return
        }
        return this.empty()[0]
    }
}

class Pad {
    constructor(container_selector) {
        
        this.STYLE = {
            on_color: 'red',
            off_color: 'powderblue',
        }
        
        this.render(container_selector)
        
        this.empty = true
        let color = () => this.empty ? this.STYLE.off_color : this.STYLE.on_color
        this.el.style.backgroundColor = color()
        this.el.draggable = !this.empty
    }
    
    render(element_id) {
        this.el = document.createElement('div')
        this.el.id = element_id
        this.el.textContent = this.el.id
        
        this.audio = new Audio()                    
        //~ this.audio.volume = 0 // MUTE
        
        this.el.appendChild(this.audio)
        
        this.el.classList.add('pad')
        
        this.el.oncontextmenu = () => false
        this.el.addEventListener('mouseup', this.mouseUp)
        this.el.addEventListener('dragstart', this.dragStart)
        this.el.addEventListener('dragover', this.dragOver)
        this.el.addEventListener('drop', this.drop)
    }
    
    mouseUp = e => {
        if (e.button === 0) {
            this.audio.play() //loadAudio('bensound-summer.mp3')
        }
        if (e.button === 2) {
            this.audio.pause()
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
        this.swap(src_el, e.target)
        
    }
    
    swap(obj1, obj2) {
        // create marker element and insert it where obj1 is
        let temp = document.createElement("div");
        obj1.parentNode.insertBefore(temp, obj1);

        // move obj1 to right before obj2
        obj2.parentNode.insertBefore(obj1, obj2);

        // move obj2 to right before where obj1 used to be
        temp.parentNode.insertBefore(obj2, temp);

        // remove temporary marker node
        temp.parentNode.removeChild(temp);
    }
    
    loadAudio(src) {
        this.audio.src = src
        this.empty = false
        let color = () => this.empty ? this.STYLE.off_color : this.STYLE.on_color
        this.el.style.backgroundColor = color()
        this.el.draggable = !this.empty
    }
    
    removeAudio() {
        this.audio.src = ''
        this.audio.load()
        this.empty = true
        let color = () => this.empty ? this.STYLE.off_color : this.STYLE.on_color
        this.el.style.backgroundColor = color()
        this.el.draggable = !this.empty  
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
