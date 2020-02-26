// load express
const express = require('express') // v14.6.4
const path = require('path') // node module
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const {generateLocationMessage } = require('./utils/messages');

const app = express() // initialize the express app
const server = http.createServer(app)
const io = socketio(server)

// calls from environment variable or port 3000
const port = process.env.PORT || 3000 // enable the port address

// main folder/source to render
const publicDirectoryPath = path.join(__dirname, '../public')

// use express static middleware to setup the server
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log(`Message from Socket connection!`)

    // to the user joining
    socket.emit('message', generateMessage('Welcome! You\'re connected.'))
    socket.broadcast.emit('message', generateMessage('A new user has joined.')) // to everyone else

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed here.')
        }
        io.emit('message', generateMessage(message)) // emit message to all the connected users
        callback()
    })

    socket.on('disconnect', () => { // emit when someone leaves the chat room
        io.emit('message', generateMessage('A user has left.'))
    })

    socket.on('sendLocation', (position, callback) => {
        io.emit('locationMessage', generateLocationMessage(position))
        callback()
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
