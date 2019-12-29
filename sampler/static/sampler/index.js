class Model {
    constructor() {}
    
    async getVideos(keyword) {
        const url = new URL(get_videos_url)
        const params = new URLSearchParams({'keyword': keyword})
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        return json
    }
}

class View {
    constructor() {
        this.search_form = this.getEl('#search_form')
    }
    
    getEl(selector) {
        return document.querySelector(selector)
    }

    bindGetVideos(handler) {
        this.search_form.addEventListener('submit', e => {
            e.preventDefault()
            let keyword = e.target.elements[0].value
            console.log(e.target)
            handler(keyword)
        })
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
        console.log(videos)
    }
}

let app = new Controller(new Model(), new View())
