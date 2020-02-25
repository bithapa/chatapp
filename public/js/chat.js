const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    // TODO: add some validation here
    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message)
})
