export {random_shade_of_red_green_or_blue}

function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`
}

function random_int(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min)
}

function random_color_power() {
    return random_int(100, 255)
}

function random_shade_of_red_green_or_blue(color_name) {
    let color_indexes = {'red': 0, 'green': 1, 'blue': 2}
    let random_rgb = [0, 0, 0]
    // If color name provided, create a random shade of the requested color.
    // Otherwise create a random shade of any color.
    if (color_name) {
        let color_index = color_indexes[color_name]
        random_rgb[color_index] = random_color_power()
    } else {
        random_rgb = [random_color_power(), random_color_power(), random_color_power()]                   
    }
    return rgb(...random_rgb)
}
