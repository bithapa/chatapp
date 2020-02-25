// load express
const express = require('express') // v14.6.4
const path = require('path') // node module
const http = require('http')
const socketio = require('socket.io')

const app = express() // initialize the express app
const server = http.createServer(app)
const io = socketio(server)

// calls from environment variable or port 3000
const port = process.env.PORT || 3000 // enable the port address

// main folder/source to render
const publicDirectoryPath = path.join(__dirname, '../public')

// use express static middleware to setup the server
app.use(express.static(publicDirectoryPath))

// 'connection' is a built-in event
io.on('connection', (socket) => {
    console.log(`Message from Socket connection!`)

    socket.emit('message', 'Welcome! Client CONNECTED!')
    socket.broadcast.emit('message', 'A new user has joined.')

    socket.on('sendMessage', (msg) => {
        io.emit('message', msg)
    })

    // on 'disconnect' (built-in)
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })

    // event: senLocation
    socket.on('sendLocation', (position) => {
        io.emit('message', `Location: ${position.latitude}, ${position.longitude}`)
    })

})

// listening to the port
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
