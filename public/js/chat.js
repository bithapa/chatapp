const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document
                                .querySelector('#location-message-template')
                                .innerHTML

// qs parse of the url search string
    // "?username=bitm&room=VB2020"
// returns username and the room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (msg) => {
    console.log(msg)
    // render msg object inside the messageTemplate
    const html = Mustache.render(messageTemplate, {
        message: msg.txt,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable button
    $messageFormButton.setAttribute('disabled', 'disabled')
    // TODO: add some validation here
    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message, (error) => {
        // this call back function is acknowledgement

        // enable the Button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered.')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation ){
        return alert('Your browser doesn\'t support Geolocation service.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    // get the current location
    navigator.geolocation.getCurrentPosition((pos) => {
        // console.log(pos)
        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared.')
        })
    })

})

socket.emit('join', { username, room })
