import {Sampler} from './sampler.js'

class Model {
    constructor() {
        this.current_sample_id = 609 //null
    }
    
    async getVideos(keyword) {
        const url = new URL(get_videos_url)
        const params = new URLSearchParams({'keyword': keyword})
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        return json.videos
    }
    
    async download(watch_url) {
        let url = new URL(download_url)
        let params = new URLSearchParams({'watch_url': watch_url})
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        this.current_sample_id = json.downloaded_sample_id
        this.onDownloaded(json.downloaded_sample_url)
    }
    
    async slc(start_sec, end_sec) {
        let url = new URL(slice_url)
        let params = new URLSearchParams({
            'sample_id': this.current_sample_id,
            'start_sec': start_sec,
            'end_sec': end_sec,
        })
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        return json
    }
    
    async cartAdd(sample_id) {
        let url = new URL(cart_add_url)
        let params = new URLSearchParams({'sample_id': sample_id})
        url.search = params
        const response = await fetch(url)
        const text = await response.text()
        return text
    }
    
    async cartRemove(sample_id) {
        let url = new URL(cart_remove_url)
        let params = new URLSearchParams({'sample_id': sample_id})
        url.search = params
        const response = await fetch(url)
        const text = await response.text()
        return text
    }
    
    bindOnDownloaded(callback) {
		this.onDownloaded = callback
	}
}

class View {
    constructor() {
        this.search_form = this.getEl('#search_form')
        this.thumbnails = this.getEl('#thumbnails')
        
        this.samplers_container = this.getEl('#samplers')
        this.samplers = [] // array of Sampler objects
        this.add_sampler_btn = this.getEl('#add_sampler_btn')
        this.add_sampler_btn.addEventListener('click', this.addSampler.bind(this))
        
        let self = this

        this.video_modal = {
            el: self.getEl('#video_modal'),
            embed_url: 'https://www.youtube.com/embed/2a4Uxdy9TQY', //assigned upon thumbnail click
            watch_url: 'https://www.youtube.com/watch?v=2a4Uxdy9TQY', //assigned upon thumbnail click
            contents: self.getEl('#video_modal_contents'),
            iframe: self.getEl('#video_modal_iframe'),
            sample_btn: self.getEl('#video_modal_sample_it'),
            close_btn: self.getEl('#video_modal_close'),
            open() {
                this.iframe.setAttribute('src', this.embed_url)
                this.el.style.display = 'flex'
            },
            close() {
                this.el.style.display = 'none'
            },
        }
        this.video_modal.sample_btn.addEventListener('click', e => {
            self.download(this.video_modal.watch_url)
        })
        this.video_modal.close_btn.addEventListener('click', e => {
            this.video_modal.close()
        })
    }
    
    getEl(selector) {
        return document.querySelector(selector)
    }
    
    createEl(tag, class_name) {
        let el = document.createElement(tag)
        if (class_name) el.className = class_name
        return el
    }
    
    bindDownload(handler) {
        this.download = handler
    }
    
    bindGetVideos(handler) {
        this.search_form.addEventListener('submit', e => {
            e.preventDefault()
            let keyword = e.target.elements[0].value
            handler(keyword)
        })
    }
    
    createThumbnails(videos) {
        console.log(videos)
        videos.forEach(video => {
            this.createThumbnail(video)
        })
    }
    
    createThumbnail(video) {
        let thumbnail = this.createEl('a', 'thumbnail')
        let thumbnail_img = this.createEl('img')
        
        thumbnail_img.src = video['thumbnail_url']
        thumbnail.href = video['embed_url']
        thumbnail.innerHTML = thumbnail_img.outerHTML
        this.thumbnails.appendChild(thumbnail)
        
        thumbnail.addEventListener('click', e => {
            e.preventDefault() // prevents following the href link when a thumbnail is clicked
            this.video_modal.embed_url = thumbnail.href
            this.video_modal.watch_url = video['watch_url']
            this.video_modal.open()
        })
    }
    
    createPads(slices) {
        slices.forEach(slice => {
            this.createPad(slice)
        })      
    }
    
    createPad(slice) {
        console.log('creating pad for slice', slice)
        let pad = this.createEl('div', 'pad')
        let audio = this.createEl('audio')
        
        pad.id = slice.id
        pad.textContent = slice.id
        audio.src = slice.url
        audio.controls = false
        
        pad.addEventListener('click', e => {
            audio.play()
        })
        pad.addEventListener('dblclick', e => {
            this.cart_add(e.target.id)
        })
        pad.addEventListener('contextmenu', e => {
            e.preventDefault()
            this.cart_remove(e.target.id)
        })
        
        pad.appendChild(audio)
        this.pads.appendChild(pad)
    }
    
    bindCartAdd(handler) {
        this.cart_add = handler
    }
    
    bindCartRemove(handler) {
        this.cart_remove = handler
    }
    
    createWaveform(sample_url) {

		this.waveform = new Waveform('#waveform')
		this.waveform.loadAudio(sample_url)
        this.waveform.canvas.addEventListener('region_export', (e) => {
            this.exportRegion(e, sample_url)
        })
	}
    	
	bindExportRegion(handler) {
		this.exportRegion = handler
	}
    
    createPads() {
        this.pads = new Pads('#pads', 16)
    }
    
    loadFreePad(slice_url) {
        Array.from(this.pads.children).forEach(pad => {
            if (pad.classList.contains('empty')) {
                let audio = document.createElement('audio')
                audio.src = slice_url
                pad.addEventListener('click', e => {
                    audio.play()
                })
                pad.appendChild(audio)
            }
        })
    }
    
    addSampler(e) {
        let el_id = `sampler_${this.samplers.length}`
        let sampler_el = this.createEl('div')
        sampler_el.id = el_id 
        let sampler = new Sampler(sampler_el)
        
        this.samplers_container.appendChild(sampler_el)
        this.samplers.push(sampler)
    }
}

class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        
        this.view.bindGetVideos(this.handleGetVideos)
        this.view.bindDownload(this.handleDownload)
        this.model.bindOnDownloaded(this.onDownloaded)
        this.view.bindExportRegion(this.exportRegion)
        this.view.bindCartAdd(this.cartAdd)
        this.view.bindCartRemove(this.cartRemove)
    }
    
    handleGetVideos = async keyword => {
        let videos = await this.model.getVideos(keyword)
        this.view.createThumbnails(videos)
    }
    
    handleDownload = async watch_url => {
        console.log('downloading', watch_url)
        await this.model.download(watch_url)
    }
    
    onDownloaded = sample_url=> {
		this.view.createWaveform(sample_url, this.exportRegion)
        this.view.createPads()
	}
    
    exportRegion = async e => {
		console.log('exporting bounds:', e.detail)
        let slice = await this.model.slc(
            e.detail.start_sec,
            e.detail.end_sec,
        )
        console.log('received slice', slice.slice_id)
        
        this.view.pads.firstEmpty().audio.id = slice.slice_id
        this.view.pads.firstEmpty().loadAudio(slice.slice_url)
    }
	
    slc = async sample_id => {
        console.log('slicing sample with ID', sample_id)
        let slices = await this.model.slc(
            sample_id,
            16,
            1000,
        )
        console.log('got the following slices:', slices)
        this.view.createPads(slices)
    }
    
    cartAdd = async sample_id => {
        let confirmation = await this.model.cartAdd(sample_id)
        console.log(confirmation)
    }
    
    cartRemove = async sample_id => {
        let confirmation = await this.model.cartRemove(sample_id)
        console.log(confirmation)
    }
}

window.app = new Controller(new Model(), new View())

//~ let sampler = new Sampler('#sampler')
