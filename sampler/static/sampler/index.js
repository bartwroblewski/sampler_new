class Model {
    constructor() {}
    
    async getVideos(keyword) {
        const url = new URL(get_videos_url)
        const params = new URLSearchParams({'keyword': keyword})
        url.search = params
        const response = await fetch(url)
        const json = await response.json()
        console.log('videos', json)
        return json
    }
}

class View {
    constructor() {}
}

class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
    }
}

let app = new Controller(new Model(), new View())
