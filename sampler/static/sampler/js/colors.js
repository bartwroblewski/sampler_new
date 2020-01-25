export {random_rgba}

function rgba(r, g, b, a) {
    return `rgb(${r}, ${g}, ${b}, ${a})`
}

function random_int(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min)
}

function random_color_power() {
    return random_int(100, 255)
}

function random_rgba(alpha) {
    let rand = [
        random_color_power(), 
        random_color_power(),
        random_color_power(),
        alpha ? alpha : 1,
    ]                 
    return rgba(...rand)
}
