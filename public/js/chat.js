const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    // TODO: add some validation here
    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message, (error) => {
        // this call back function is acknowledgement
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered.')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation ){
        return alert('Your browser doesn\'t support Geolocation service.')
    }

    // get the current location
    navigator.geolocation.getCurrentPosition((pos) => {
        // console.log(pos)
        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, () => {
            console.log('Location Shared.')
        })
    })

})
