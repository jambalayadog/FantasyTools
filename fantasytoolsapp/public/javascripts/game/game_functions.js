var table_elem = document.getElementById('counter')
var player_buttons = document.getElementById('player_buttons')
var counter = 0
table_elem.innerHTML = counter
var fps = 1
var buttons_list = []

setInterval(() => {
    // prints out "2", meaning that the callback is not called immediately after 500 milliseconds.
    core_loop()
}, 250)

initialize()

function core_loop() {
    counter += 1
    //console.log(counter)
    table_elem.innerHTML = counter
    check_counter()
}

function check_counter() {
    if (counter >= 10) {
        create_button('advance_time')
    }
}

function initialize() {
    create_button()
}

function create_button(button='player_button') {
    // check if button already exists
    if (buttons_list.includes(button) == false) {
        // create the button element and associated parameters
        // this can probably be a jade/pug reference
        // do we want an dictionary of buttons?
        var button_element = document.createElement("button")
        var button_text = document.createTextNode(button)
        button_element.appendChild(button_text)
        button_element.classList.add('button')
        var args  // get args from button data
        button_element.addEventListener('click', () => window[button](args))
        // add the player buttons *& update the display
        buttons_list.push(button)
        player_buttons.appendChild(button_element) // replace this with update display function so we accurately update all the button objects
        
    }
}

function update_buttons() {
    // for button in button list
    // make the button
    // do buttons have button data?  do i need an object list?
}


function advance_time(time = 10) {
    console.log(`time: ${time}`)
    console.log('advance_time')
    counter += time
}

function player_button() {
    console.log('player_button')
    counter += 100
}