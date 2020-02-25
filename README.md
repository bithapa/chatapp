# chatapp
---
## TOC
- [x] 0. Files Tree
- [x] 1. Setting thins up!
- [x] 2. WebSockets: Full Duplex Communication
- [x] 3. Socket.io Events
- [x] 4. Broadcasting Events
- [x] 5. Sharing Location: MDN Geolocation API
- [x] 6. Socket Acknowledgements!
---
# 0. Files Tree:

```
    chatapp
        |-src
        |   |-index.js
        |-public
        |   |-js
        |   |  |-chat.js
        |   |-index.html
        |-package-lock.json
        |-package.json
        |-README.json
```
---
# 1. Setting things up

- initialize the NodeJS project:
    - create chatapp folder and run `npm init`, all the values can be default
- Build a Node server:

```javascript
    // chatapp/src/index.js:

    // load express
    const express = require('express') // npm i express@14.6.4
    const path = require('path') // node module
    const app = express() // initialize the express app

    // server call from environment variable or port 3000
    const port = process.env.PORT || 3000

    // main folder/source to render
    const publicDirectoryPath = path.join(__dirname, '../public')

    // use express static middleware to setup the server
    app.use(express.static(publicDirectoryPath))

    // listening to the port
    app.listen(port, () => {
        console.log(`Server is up on port ${port}!`)
    })
```

- Setup `public` directory:
create `chatapp/public/index.html` file
```html
    // chatapp/public/index.html
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
        <head>
            <meta charset="utf-8">
            <title>Chat App</title>
        </head>
        <body>
            <h1>
                Chat App!
            </h1>
        </body>
    </html>
```

- Setup Script

In `chatapp/package.json`:

```
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "start": "node src/index.js",
      "dev": "nodemon src/index.js"
    }
```
- install `nodemon` as development dependency: `npm i nodemon@1.18.7 --save-dev`

```
    Commands:
                    to run the project:     npm run start
            to run in development mode:     npm run dev

```
---
# 2. WebSockets: Full Duplex Communication
- bidirectional communication between the client and the server
- webSocket protocol is different from http
- persistent connection between the client and the server

- install `socket.io`: `npm i socket.io@2.2.0`
- In `src/index.js`
```javascript
    const http = require('http')            // enables http protocol
    const socketio = require('socket.io')   // enable webSocket protocol
    ...
    const app = express()
    const server = http.createServer(app) // create server using http
    const io = socketio(server)             // use http server with socket.io
    ...
    // print sth with socket
    // io.on(e, f) : function f runs when event e occurs
    io.on('connection', () => {
        console.log(`message from webSocket connection!`)
    })  // this requires the connection of the server to the client side
        // connect socket.io in public/index.html

    server.listen(port, () => {
        console.log(`Server is up on port ${port}!`)
    })
```

- Server-Client connection for webSocket:
    - in `public/index.html`
```html
    ...
    Chat App!

    // client side version of the library for socket connection
    // make a client side JS file and use the libraries provided by
    // the following script
    </body>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/chat.js"></script>
    ...
```
- Create `public/js/chat.js` and load the script
```
    // public/js/chat.js
    io()    // provided by the socket.io script in the index.html
```
---
# 3. Socket.io Events
??? *need to study more on this*
- when some events occurs (for eg. 'connection') either on client side or on server side, we can ask socket to run certain task (for eg. sending a message)
    - emit a message from a server side `on` 'connection' (when new client connects),
    - have that message displayed on the client side (have client listen the event)

```javascript
    // src/index.js
    ...
    io.on('connection', (socket) => {
        console.log('Message from webSocket connection!')

        // when the event 'message' occurs 'Welcome!' message is sent
        socket.emit('message', 'Welcome!')
    })
    ...
```

```javascript
    // public/js/chat.js
    const socket = io()
    // when the 'message' event occurs the function is executed that takes the message param
    socket.on('message', (message) => {
        console.log(message)
    })
```

- Now, create a form to get the input message and have that rendered on console
```html
    <!--public/index.html-->
    ...
    Chat App!
    <form id="message-form">
        <input placeholder="message"></input>
        <button>Send<button>
    </form>
    ...
```
- once the form is submitted, 'submit' event occurs (note, not explicitly mentioned in index.html); we need to grab that event from the client side
- Next, emit the event called 'sendMessage' with the input string
```javascript
    // public/chat.js
    const socket = io()

    socket.on('message', (message) => {
        console.log(message)
    })

    // access the form using id and add the submit event
    // e is a default event argument  
    document.querySelector('#message-form').addEventListener('submit', (e) ={
        e.preventDefault() // prevent full page refresh

    // grab the input string
    // const message = document.querySelector('input').value
    // this (grabbed by name tag) is less likely to break than querySelector
        const message = e.target.elements.msg.value
    // emit the event with the input message
        socket.emit('sendMessage', message)
    // make sure that the event 'sendMessage' is received in the server side
    })
```
- Receive the event 'sendMessage' in the server side
```javascript
    ...
    io.on('connection', (socket) => {
        console.log(`Message from Socket connection!`)

        socket.emit('message', 'Welcome! Client CONNECTED!')

        // msg here is the message from the client-side event sendMessage
        io.on('sendMessage', (msg) => {
            socket.emit('message', msg)
        })
    })
    ...
```
# 4. Broadcasting Events
- `broadcast` helps integrate the status of the users
- send a message `A new user has joined.` to everyone except the one that just joined
```javascript
    ...
    socket.emit('message', 'Welcome! Client CONNECTED!')
    socket.broadcast.emit('message', 'A new user has joined.')
    ...
```
- So far, we have three ways a server can emit an event:
```
                socket.emit: to emit the event to the particular connection,
      socket.broadcast.emit: to emit to everyone except itself
                    io.emit: to emit to everyone

```
- Send message 'A user has left.' to everyone once the user leaves chat

```javascript
    // src/index.js
    io.on('connection', (socket) => {
        console.log(`Message from Socket connection!`)

        socket.emit('message', 'Welcome! Client CONNECTED!')
        socket.broadcast.emit('message', 'A new user has joined.')

        socket.on('sendMessage', (msg) => {
            io.emit('message', msg)
        })

        // use the built-in event 'disconnect', note it uses `socket` to emit this event
        socket.on('disconnect', () => {
            // since we want to let everyone know, we use emit
            io.emit('message', 'A user has left.')
        })
    })
```
# 5. Sharing Location: MDN Geolocation API
- First, create a button
```html
// public/index.html
...
    <h1>
        Chat App!
    </h1>
    <form id="message-form">
        <input name="msg" placeholder="message" />
        <button>Send</button>
    </form>
    <button id="send-location">Send Location</button>
...
```
- Next, add the event 'click' in client-side for this button

```javascript
// public/chat.js
...
    document.querySelector("#send-location").addEventListener('click', () => {
        // make sure that browser supports Geolocation
        if ( !navigator.geolocation ) {
            return alert('Your browser does not support Geolocation service.')
        }

        // get the user's Location
        navigator.geolocation.getCurrentPosition( (position) => {
            console.log(position)
        })
    })
```
- Now, create an event 'sendLocation' and render the location in the browser, note that the event here is emitted inside the `navigator.geolocation.getCurrentPosition` function. This function is provided by [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
```javascript
// public/js/chat.js
    ...
    navigator.geolocation.getCurrentPosition( (pos) => {
        // Use this to fetch the current position, shown in JSON format
        // console.log(position)

        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        })
    })
```
- Make sure that the event is received by the server
```javascript
// index.js
    ...
    socket.on('sendLocation', (position) => {
        io.emit('message', `Location: ${position.latitude}, ${position.longitude}`)
    })
```
- The query format for Google map's location is `https://www.google.com/maps?q=latitude,longitude`, where `latitude` and `longitude` are actual coordinates.
We now instead want to render this link.
```javascript
// index.js
    ...
    socket.on('sendLocation', (position) => {
        io.emit('message', `https://www.google.com/maps?q=${position.latitude},${position.longitude}`)
    })
    ...
```
# 6. Socket Acknowledgements!
- Well acknowledgements are acknowledgements. Basically callback function provided to the event that acknowledge that event was occurred.
```javascript
    // public/js/chat.js
    ...
    document.querySelector('#message-form').addEventListener('submit', (e) => {
        e.preventDefault()
        const message = e.target.elements.msg.value
        // add the callback acknowledgement
        socket.emit('sendMessage', message, () => {
            console.log('The message was delivered.')
        })
    })
    ...
```
- Now, with that client expects server to acknowledge this acknowledgement.
- note that callback can take as many parameter as we want,
- provide a message 'Acknowledged.' to callback as parameter
```javascript
    // index.js
    ...
    // set up param callback that acknowledges
    socket.on('sendMessage', (msg, callback) => {
        io.emit('message', msg)
        callback()
    })
    ...
```
- The parameter sent to `callback()` in server can be fetched in the client side `chat.js` as
```javascript
    // public/js/chat.js
    ...
    document.querySelector('#message-form').addEventListener('submit', (e) => {
        e.preventDefault()
        const message = e.target.elements.msg.value
        // add the callback acknowledgement
        socket.emit('sendMessage', message, (serverMessage) => {
            console.log('The message was delivered.', `${serverMessage}`)
        })
    })
    ...
```
