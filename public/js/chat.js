const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// qs parse of the url search string
    // "?username=bitm&room=VB2020"
// returns username and the room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // Height of the new Message
    const newMessageStyles = getComputedStyle($newMessage)
    // console.log(newMessageStyles)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    // render msg object inside the messageTemplate
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.txt,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (locationMessage) => {
    console.log(locationMessage)
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html =   Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        // redirect
        location.href = '/'
    }
})
