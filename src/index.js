// load express
const express = require('express') // v14.6.4
const path = require('path') // node module
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
// const { generateLocationMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom } = require('./utils/users');

const app = express() // initialize the express app
const server = http.createServer(app)
const io = socketio(server)

// calls from environment variable or port 3000
const port = process.env.PORT || 3000 // enable the port address

// path to client side
const publicDirectoryPath = path.join(__dirname, '../public')

// use express static middleware to setup the server
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log(`Message from Socket connection!`)

    socket.on('join', ( { username, room}, callback ) => {
        const {user, error} = addUser({id: socket.id, username, room})
        if( error ) {
            return callback(error)
        }
        // join() is a socket method that
        // allows you to join the specifc chat room
        socket.join(user.room)

        // to all the user joining the specific room
        socket.emit('message', generateMessage('Welcome! You\'re connected.'))
        // to everyone else in a specifc room: to()
        socket.broadcast.to(user.room)
                .emit('message',generateMessage(`${user.username} has joined.`))
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed here.')
        }
        // emit message to all the connected users
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('disconnect', () => {
        // emit when someone leaves the chat room
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
