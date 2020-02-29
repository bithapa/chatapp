// load express
const express = require('express') // v14.6.4
const path = require('path') // node module
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

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

    socket.on('join', ( options, callback ) => {
        // options = {username, room}
        const {error, user} = addUser({ id: socket.id, ...options })
        if( error ) {
            return callback(error)
        }
        // join() is a socket method that allows you to join the specifc chat room
        socket.join(user.room)

        // to all the user joining the specific room
        socket.emit('message', generateMessage('admin', 'Welcome!'))
        // to everyone else in a specifc room: to()
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined.`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed here.')
        }
        // emit message to all the connected users
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        // emit when someone leaves the chat room
        if (user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData',  {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, position))
        callback()
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
