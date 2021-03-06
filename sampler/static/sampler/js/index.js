import {Sampler} from './sampler.js'

class Request {
    constructor(url, params) {
        this.url = new URL(url)
        this.params = new URLSearchParams(params)
        this.url.search = this.params
    }
    
    async make() {
        const response = await fetch(this.url)
        const json = await response.json()
        return json
    }
}

class Model {
    constructor() {}
    
    async getVideos(keyword) {
        const request = new Request(get_videos_url, {'keyword': keyword})
        const json = await request.make()
        return json.videos    
    }
    
    async download(watch_url) {
        const request = new Request(download_url , {'watch_url': watch_url})
        const json = await request.make()
        return json
    }
    
    async slc(start_sec, end_sec, sample_id) {
        const request = new Request(slice_url, {
            'start_sec': start_sec,
            'end_sec': end_sec,
            'sample_id': sample_id,
        })
        const json = await request.make()
        return json
    }
    
    async getSamples(sample_id) {
        const request = new Request(get_samples_url , {'sample_id': sample_id})
        const json = await request.make()
        return json
    }
    
    serve(sample_ids) {
        const url = new URL(serve_url)
        const params = new URLSearchParams({'sample_ids': sample_ids})
        url.search = params
        window.location = url
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
        
        this.info_icon = this.getEl('#info_icon')
        this.info_modal = this.getEl('#info_modal')
        
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
                this.iframe.removeAttribute('src')
                this.el.style.display = 'none'
            },
        }
        
        this.info_icon.addEventListener('click', e => {
            this.info_modal.style.display = 'flex'
            setTimeout(function() {
                this.info_modal.style.opacity = 1
            }, 50)
        })
        window.addEventListener('click', e => {
            if (e.target === this.info_modal) {
                e.target.style.display = 'none'
                e.target.style.opacity = 0
            }
            
            if (e.target === this.video_modal.el) {
                this.video_modal.close()
            }
        })

        this.video_modal.sample_btn.addEventListener('click', e => {
            this.video_modal.close()
            let sampler = this.addSampler()
            self.download(this.video_modal.watch_url, sampler)
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
        videos.forEach(video => {
            this.createThumbnail(video)
        })
    }
    
    createThumbnail(video, container) {
        let thumbnail = this.createEl('a', 'thumbnail')
        let thumbnail_img = this.createEl('img')
        
        thumbnail_img.src = video['thumbnail_url']
        thumbnail.href = video['embed_url']
        thumbnail.innerHTML = thumbnail_img.outerHTML
        this.thumbnails.insertBefore(thumbnail, this.thumbnails.firstChild)
        
        thumbnail.addEventListener('click', e => {
            e.preventDefault() // prevents following the href link when a thumbnail is clicked
            this.video_modal.embed_url = thumbnail.href
            this.video_modal.watch_url = video['watch_url']
            this.video_modal.open()
        })
        
        thumbnail.draggable = true
        thumbnail.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', video['watch_url'])
        })
    }
    
	bindExportRegion(handler) {
		this.exportRegion = handler
	}
    
    bindServe(handler) {
        this.serve = handler
    }
    
    addSampler(e) {
        console.log('adding sampler')
        
        let el_id = `sampler_${this.samplers.length}`
        let sampler_el = this.createEl('div')
        sampler_el.id = el_id 
        this.samplers_container.insertBefore(
            sampler_el, 
            this.samplers_container.firstChild
        )
        
        let sampler = new Sampler(sampler_el)
        this.samplers.push(sampler)
        
        sampler.waveform.canvas.addEventListener('region_dblclick', e => {
            let start_sec = e.detail.start_sec
            let end_sec = e.detail.end_sec
            this.exportRegion(start_sec, end_sec, sampler)
        })
        
        sampler.waveform.canvas.addEventListener('waveform_drop', e => {
            let watch_url = e.detail
            this.download(watch_url, sampler)
        })
        
        sampler.settings.el.addEventListener('serve_btn_click', e => {
            let sample_ids = e.detail
            this.serve(sample_ids)
        })
        
        sampler.settings.url_form.addEventListener('url_form_submit', e => {
            let watch_url = e.detail
            this.download(watch_url, sampler)
        })
        
        return sampler
    }
}

class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        
        this.view.bindGetVideos(this.getVideos)
        this.view.bindDownload(this.download)
        this.view.bindExportRegion(this.exportRegion)
        this.view.bindServe(this.serve)
    }
    
    getVideos = async keyword => {
        let videos = await this.model.getVideos(keyword)
            .catch(e => alert('Error getting the videos list. Please try again in a sec.'))

        videos ?
            this.view.createThumbnails(videos)
        :
            alert('Seems like no videos could be found for this keyword.')
    }
    
    download = async (watch_url, sampler) => {
        console.log('downloading', watch_url)
        
        sampler.waveform.reset()
        let message = `Downloading ${watch_url}...`
        sampler.waveform.displayMessage(message)
        
        let json = await this.model.download(watch_url)
            .catch(e => sampler.waveform.displayMessage('Error! Please try again in a sec or choose another video.'))
        
        sampler.waveform.loadAudio(json.downloaded_sample_url)
        sampler.waveform.sample_data = json
        
        sampler.waveform.drawWave()
    }
    
    exportRegion = async (start_sec, end_sec, sampler) => {
		console.log('exporting bounds:', start_sec, end_sec)
        
        let sample_id = sampler.waveform.sample_data.downloaded_sample_id
        let target_pad = sampler.pads.firstEmpty()
        
        target_pad.loading()
        
        let slice = await this.model.slc(start_sec, end_sec, sample_id)
            .catch(e => {
                target_pad.errored()
                alert('Error slicing the sample! Try again or choose another one.')
            })
            
        console.log('received slice', slice.slice_id)
        target_pad.audio.id = slice.slice_id
        target_pad.loadAudio(slice.slice_url)
    }
    
    serve = async sample_ids => {
        sample_ids.length > 0 ? 
            this.model.serve(sample_ids) 
        :
            alert('Load samples to pads first!')  
    }
}

window.app = new Controller(new Model(), new View())
