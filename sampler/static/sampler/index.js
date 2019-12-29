class Model {
    constructor() {}
    
    async getVideos(keyword) {
        const url = new URL(get_videos_url)
        const params = new URLSearchParams({'keyword': keyword})
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        return json.videos
    }
}

class View {
    constructor() {
        this.search_form = this.getEl('#search_form')
        this.thumbnails = this.getEl('#thumbnails')
    }
    
    getEl(selector) {
        return document.querySelector(selector)
    }
    
    createEl(tag, class_name) {
        let el = document.createElement(tag)
        if (class_name) el.className = class_name
        return el
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
        let el = this.createEl('div', 'thumbnail')
        this.thumbnails.appendChild(el)
    }
}


class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        
        this.view.bindGetVideos(this.handleGetVideos)
    }
    
    handleGetVideos = async keyword => {
        let videos = await this.model.getVideos(keyword)
        this.view.createThumbnails(videos)
    }
}

let app = new Controller(new Model(), new View())
