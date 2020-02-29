# chatapp
---
## TOC
- [x] 0. Files Tree
- [x] 1. Setting thins up!
- [x] 2. WebSockets protocols: Full Duplex Communication
- [x] 3. Socket.io Events
- [x] 4. Broadcasting Events
- [x] 5. Sharing Location: MDN Geolocation API
- [x] 6. Socket Acknowledgements!
- [x] 7. Forms and Button (with Acknowledgements)
- [x] 8. Rendering Messages with `Mustache`
- [x] 9. Rendering Location
- [x] 10. timestamp: Messing with Time and `MomentJS`
- [x] 11. Styling the Chat App (`css`)
- [x] 12. Adding a login page (`chat` becomes `index`!)
- [x] 13. Sockets.io Rooms
- [x] 14. Storing Users: Part I (`JavaScript` functions)
- [x] 15. Storing Users: Part II (more `JavaScript` functions)
- [x] 16. Tracking Users joining and leaving
- [x] 17. Sending messages to rooms
- [x] 18. Rendering User List
- [x] 19. Autoscrolling
- [x] 20. Deployment

---
# 0. Files Tree:
```
    chatapp
        |-src
        |   |-index.js
        |   |-utils
        |   |   |-messages.js
        |   |   |-users.js
        |-public
        |   |-css
        |   |  |-styles.css
        |   |  |-styles.min.css
        |   |-img
        |   |  |-favicon.png
        |   |-js
        |   |  |-chat.js
        |   |-index.html
        |   |-chat.html
        |-package-lock.json
        |-package.json
        |-README.json
```
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
        callback('Acknowledged.')
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
- Acknowledgement allows to use npm module `bad-words` to filter the message for profanity
- To install: `npm i bad-words@3.0.0`
- Check for the profanity in the message received from client
```javascript
    // index.js
    ...
    const Filter = require('bad-words')
    ...
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if (!filter.isProfane(msg)) {
            return callback('Profanity is not allowed here.')
        }
        io.emit('message', msg)
        callback('Acknowledged.')
    })
    ...
```
- Change the callback function to incorporate Error
```javascript
    // public/js/chat.js
    ...
    document.querySelector('#message-form').addEventListener('submit', (e) => {
        e.preventDefault()
        const message = e.target.elements.msg.value
        socket.emit('sendMessage', message, (error) => {
            if (error) {
                console.log(error)
            }
            console.log('Message Delivered.')
        })
    })
    ...
```
- Acknowledgement for Sharing Location
- set up a client acknowledgement function
- set up the server to send back the acknowledgement
- have the client print "Location shared!" when acknowledged

    - add a function parameter in 'sendLocation'
    - add callback function in server
```javascript
// public/js/chat.js
    ...
    navigator.geolocation.getCurrentPosition( (pos) => {
        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, () => {
            console.log('Location shared.')
        })
    })
```
```javascript
// index.js
    ...
    socket.on('sendLocation', (position, callback) => {
        io.emit('message', `https://www.google.com/maps?q=${position.latitude},${position.longitude}`)

        callback()
    })
    ...
```
# 7. Forms and Button (with Acknowledgements)
- Enabling and disabling button between when the message is sent and when the message s received
- create elements for code efficiency
- once the message is sent, clear the input field, and add focus cursor
```
    disable:
        document.querySelector('#message-form').querySelector('button').setAttribute('disabled', 'disabled')
    enable:
        document.querySelector('#message-form').querySelector('button').removeAttribute('disabled')
    clear input field:
        document.querySelector('#message-form').querySelector('input').value = ''
    set focus:
        document.querySelector('#message-form').querySelector('input').focus()
```
```javascript
    // public/js/chat.js
    ...
    // elements
    const $messageForm = document.querySelector('#message-form')
    const $messageFormInput = $messageForm.querySelector('input')
    const $messageFormButton = $messageForm.querySelector('button')
    ...
    $messageForm.addEventListener('submit', (e) => {
        e.preventDefault

        //disable the form
        $messageFormButton.setAttribute('disabled', 'disabled')
        const message = e.target.elements.msg.value
        socket.emit('sendMessage', message, (error) => {
            // enable the form
            $messageFormButton.removeAttribute('disabled')
            // clear input field
            $messageFormInput.value = ''
            // set focus
            $messageFormInput.focus()
            if (error) {
                return console.log(error)
            }
            console.log('Message delivered.')
        })
    })
```
- Now, do the same thing for the event 'sendLocation'. Note that there is only one element for '#send-location (why?)'.
```
    disable:
        document.querySelector('#send-location').setAttribute('disabled', 'disabled')
    enable:
        document.querySelector('#send-location').removeAttribute('disabled')
```
```javascript
    // public/js/chat.js
    ...
    const $sendLocationButton = document.querySelector('#send-location')
    ...
    $sendLocationButton.addEventListener('click', () => {
        ...
        $sendLocationButton.setAttribute('disabled', 'disabled')

        navigator.geolocation.getCurrentPosition( (pos) => {
            socket.emit('sendLocation', {
                ...
            }, () => {
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared.')
            })
        })
    })
```
# 8. Rendering Messages with `Mustache`
/[Link](https://links.mead.io/chatlibs) to Libraries./
- Libraries:
    1. Mustache
    2. Moment
    3. QS
- import the libraries on index.html

```html
    <!-- /public/index.html -->
    ...
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.6.0/qs.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/chat.js"></script>
</body>
</html>
```
- Define a message rendering template in `index.html`
```html
    <!-- index.html -->
    <div id="messages"></div>
    ...
    <script id="message-template" type="text/html">
        <p>{{message}}<p>
    </script>
```
- render the message: you need
    - the template
    - the place where you render the message (in our case `<div id="messages">`)
    - render inside the `'message'` event
    - note that `innerHTML` tag in `messageTemplate` is important in order to get the html content of the template
```javascript
    // chat.js
    ...
    const $messages = document.querySelector('#messages') // grab the div
    // grab the template as HTML
    const messageTemplate = document.querySelector('#message-template').innerHTML

    socket.on('message', (msg) => {
        ...
        const html = Mustache.render(messageTemplate, {message: msg})
        $messages.insertAdjacentHTML('beforeend', html)
    })
```
# 9. Rendering Location
- This is similar to the rendering message
```HTML
    <!-- index.html -->
    ...
    <script id="location-message-template" type="text/html">
        <div>
            <p><a href="{{url}}" target="_blank">my current location</a><p>
        </div>
    </script>
    ...
```
```javascript
    // chat.js
    ...
    const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
    // location message is emitted at the server index.js
    socket.on('locationMessage', (locationLink) => {
        const html = Mustache.render(locationMessageTemplate, {url:locationLink})
        $messages.insertAdjacentHTML('beforeend', html)
    })
```
# 10. timestamp: Messing with Time
- javascript provides some built-in time functionality. This can be tested in the console provided with the web developer tools
```
    const now = new Date()
    now.toString()  // "Tue Feb 25 2020 14:50:51 GMT-0500 (Eastern Standard Time)"
    now.getDate()   // 25
    now.getTime()   // 1582660251241 == 50.18 years
```
- `getTime()` provides the number of milliseconds since UNIX epic (midnight Jan 1st, 1970). Positive number go into future and negative number go to past from the epic.
- Display the time of the message: Emit two things-- message and the timestamp
    - by providing two arguments (message and timestamp) to the event,
    - OR by providing single object as argument (message and timestamp would be object properties).
```javascript
    // index.js
    ...
    socket.emit('message', {
        text: "Welcome! You're connected.",
        createdAt: new Date().getTime()
    })
    ...
```
- Create the function that generates the above object (this is because we don't have to type all the code every time we need the object. efficiency!).
    - create `chatapp/src/utils/messages.js`
```javascript
    // src/utils/messages.js

    // the function takes the message `text` as argument and returns an object with
    // `text` and `timestamp`
    const generateMessage = (text) => {
        return {
            text,
            createdAt: new Date().getTime()
        }
    }

    module.exports = {
        generateMessage
    }
```
- Now, call the function in server:
```JavaScript
    // index.js
    ...
    const { generateMessage } = require('./utils/messages')
    socket.emit('message', generateMessage('Welcome! You\'re connected.'))
    ...
```
- Now, we need to adjust the client side as well

```JavaScript
    // chat.js
    ...
    // msg now is an object
    //  to render actual message we call msg.txt
    socket.on('message', (msg) => {
        console.log(msg)
        // render msg inside the messageTemplate
        const html = Mustache.render(messageTemplate, {
            message: msg.txt
        })
        $messages.insertAdjacentHTML('beforeend', html)
    })
    ...
```
- We can use `generateMessage()` in all the four message emit events in server.
``` JavaScript
    // index.js
    ...
    // to the users joining
    socket.emit('message', generateMessage('Welcome!, You\'re connected.'))

    // to all the other users
    socket.broadcast.emit('message', generateMessage('A new user has joined.'))
    ...
    // when the users leaves room
    socket.on('disconnet', () => {
        io.emit('message', generateMessage('A user has left.'))
    })
    ...
```
- Integrate timestamp on the message-template
```html
    <!-- index.html -->
    ...
    <script id="message-template" type="text/html">
        <div>
            <p>{{createdAt}} - {{message}}</p>
        </div>
    </script>
    ...
```
- Adjust the object (add timestamp) that is passed into the template.
- Right now timestamp is just a big number, we need to show this in an understandable manner. That's where `momentjs` (imported earlier as one of the js dependency in index.html) comes to play.
    - go to [MomentJS](https://momentjs.com/),
        - go to docs/display,
    - check the tokens used to format the dates and time by using `moment().format()`,
    - the timestamp is passed into the `moment()`
```javascript
    // chat.js

    socket.on('message', (msg) => {
        console.log(msg)
        // render msg inside the messageTemplate
        const html = Mustache.render(messageTemplate, {
            message: msg.txt,
            createdAt: moment(msg.createdAt).format('hh:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)
    })
```
*[Note: The timestamp can be added to location messages in similar way.]*
# 11. Styling the Chat App (`css`)
- import the stylesheets to html
- Note that `styles.min.css` runs faster than the `styles.css`
    - this will change the style of the chatapp in some way
```HTML
    <!-- index.html -->
    <head>
        ...
        <link rel="icon" href="/img/favicon.png">
        <link rel="stylesheet" href="/css/styles.min.css">
    </head>
```
- Now to style the `<body >` of the the Chat app, create a `<div >`, inside which there will be two more `<div >`s: `chat__sidebar` (for sidebar) and `chat__main` (for main messaging section).
    - move the messaging section into the `chat__main` div
- More adjustments: make the other adjustments as shown below.
```HTML
    <!-- index.html -->
    ...
    <body>
        <div class="chat">
            <div class="chat__sidebar">

            </div>

            <div class="chat__main">
                <div id="messages" class="chat__messages">
                </div>

                <div class="compose">
                    <form id="message-form">
                        <input name="msg" placeholder="Message" /> <!--input-->
                        <button>Send</button> <!--button-->
                    </form>
                    <button id="send-location">Send Location</button>
                </div>
            </div>
        </div>

        <script id="message-template" type="text/html">
            <div class="message">
                <p>
                    <span class="message__name">User_name</span>
                    <span class="message__meta">{{createdAt}}</span>
                </p>
                <p>{{message}}</p>
            </div>
        </script>

        <script id="location-message-template" type="text/html">
            <div class="message">
                <p>
                    <span class="message__name">User_name</span>
                    <span class="message__meta">{{createdAt}}</span>
                </p>
                <p><a href="{{url}}" target="_blank">my current location</a></p>
            </div>
        </script>
```
# 12. Adding a login page (`chat` becomes `index`!)
- For this, we want our main index page to be a log in form where users can log in. To do this create a new `/public/chat.html` file and and move all the code from `index.html` to `chat.html`. `index.html` is modified to display a user's log in form.
# 13. Sockets.io Rooms
- when you log in as `bitm` in room `VB2020` you get the chat room link that is automatically generated as `http://localhost:3000/chat.html?username=bitm&room=VB2020`. In order to setup the chatroom that multiple users can access to we need to parse the string after the main url i.e. `?username=bitm&room=VB2020`.
- To check this in console
```
    location.origin:    "http://localhost:3000"
    location.search:    "?username=bitm&room=VB2020"
```
- We'll be using `qs.js` (query string) to parse the string.
- To Parse:
    - `{ ignoreQueryPrefix: true }` removes the `?` sign in front of the string
- Once we have our `username` and `room` set, we can emit new event for joining a specific room.
```javascript
    // chat.js
    ...
    // options
    // returns strings username and room
    const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})
    ...
    // emit the event 'join'
    socket.emit('join', {username, room})
```
- We've just parsed the string and get username and room as object. We've emitted an event called 'join' with those arguments.
- Now, in the server side set up a listener for this event.
    - To join the individual chat room, use Socket' join method that can only be used in server: `socket.join()`. This gives access to emitting any events to just this specific room.
    - Here, with rooms, we introduce two more methods of emitting the message
    ```
                    socket.emit() - to emit the event to the particular connection,
          socket.broadcast.emit() - to emit to everyone except itself
                        io.emit() - to emit to everyone

                     io.to.emit() - to everyone in a specific chatroom
       socket.broadcast.to.emit() - to everyone except itself in a specific chatroom
    ```
    - Remember the two methods for 'message' event: `socket.emit()` and `socket.broadcast.emit()`; since we are incorporating room now we want to modify this methods with `.to.emit()` and put them inside the `join` event.

```javascript
    // server.js

    socket.on('join', ({username, room}) => {
        socket.join(room)

        // modified version of message events with .to.emit()

        // the first one is fine because it's emitting the message to specific socket
        socket.emit('message', generateMessage('Welcome!You\'re connected.'))
        // For this, we need to add .to.emit(). Otherwise, it will send message to everyone
        //regardless of what room they are in
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined.`))
    })
```
- So far
    - you can join separate rooms,
    - when a user logs in a room, everyone else except the user get the message saying `${username} has joined.`
    - But,
        - while sending messages message goes to all the active rooms, instead of a specific chatroom
- Let's fix this.
# 14. Storing Users: Part I
- In order to send the message to specific room, we need to to keep track of which users are active in which rooms.
- Note that the objects properties returned by the qs parser, `{ username, room }`, as of now are only accessible in the event 'join.'

    - create 'src/utils/users.js'
    -  methods implemented:
        ```
            users[]

            addUser()
            removeUser()
            getUser()
            getUsersInRoom()
        ```
```JavaScript
    // src/utils/users.js

    const users = []


    // takes a user object {id,username,room}, validates,
    // stores in the array users[], and returns the object
    const addUser = ( { id, username, room }) => {
        // Clean the input
        username = username.trim().toLowerCase()
        room = room.trim().toLowerCase()

        // validation

        if ( !username || !room ) {
            return {
                error: 'Username and room are required!'
            }
        }

        // check for existing user
        // iterates over the users[] array and checks
        // if username and room match
        const existingUser = users.find( (user_in_users) => {
            return user_in_users.username === username && user_in_users.room === room
        })
        if ( existingUser ) {
            return {
                error: 'Username already in use!'
            }
        }

        // store user
        const user = { id, username, room }
        users.push(user)

        return { user }
    }

    // removing the user with it's id
    const removeUser = (id) => {
        // iterate over the users[] array and
        // get the index of the user with given id
        // shorthand: const index = users.findIndex( (user) => user.id === id)
        // returns -1 if not found
        const index = users.findIndex( (user) => {
            return user.id === id
        })

        if ( index != -1) {
            // users.splice(index, 1) is an array of objects that are
            // removed from the users[] array; however, since we are removing
            // only one `(index, 1)` object [o] is provided at the end
            return users.splice(index, 1)[0]
        }

        return {
            error: 'User doesn\'t exist!'
        }
    }
```
# 15. Storing Users: Part II (more `JavaScript` functions)
- Here we implement
    ```
        getUser()
        getUsersInRoom()
    ```
```JavaScript
    // src/utils/users.js
    ...
    // accepts the id and returns
    // the user object with that id
    const getUser = (id) => {
        // check if the user exist or not
        return users.find((user) => user.id === id
        )
    }

    // returns all the users object in the given room
    const getUsersInRoom = (room) => {
        return users.filter((user) => user.room === room)
    }
    ...
```
- *Don't forget to export the functions*
# 16. Tracking Users joining and leaving
- Now we have `addUser` we use this first.
    - we can get either `error` or `user` from the `addUser()`
    - if `error`, we send the acknowledgement to the client through callback
```javascript
    // src/index.js
    ...
    io.on('connection', (socket) => {
        console.log('Message from Socket connection!')
        // add callback
        socket.on('join', ( { username, room}, callback ) => {
            // add the user
            const {user, error} = addUser({id: socket.id, username, room})
            if (error) {
                return callback(error)
            }

            socket.join(user.room)

            socket.emit('message', generateMessage('Welcome! You\'re connected.'))
            socket.broadcast.to(user.room)
                    .emit('message',generateMessage(`${user.username} has joined.`))
            // add callback
            callback()
        })
    })
```

```javascript
                // Note: {username, room} can be destructured as:

                    socket.on('join', (options, callback ) => {
                        // add the user
                        const {user, error} = addUser({id: socket.id, ...options})
                        if (error) {
                            return callback(error)
                        }
                    ...
                    })
```

```javascript
    // public/chat.js
    ...
    // add the callback in case of error
    socket.emit('join', { username, room }, (error) => {

    })
```
- Now we want to remove the user from the room once the user disconnects, but note we want to emit the message only when an actual user disconnects
```javascript
    // index.js
    ...
    socket.on('disconnect', () => {
        const user =  removeUser(socket.id)

        if ( user ) {
            io.to(user.room).emit('message', `${user.username} has left!`)
        }
    })
    ...
```
- Now we can also handle errors when there is error such as two same username joining the room. This is done with the callback function at the client side.
    - If there is error we show what went wrong and we redirect the user to the home page using `location.href`
```javascript
    // public/chat.js
    ...
    socket.emit('join', {username, room}, ( error ) => {
        if ( error ) {
            alert(error)
            location.href = '/'
        }
    })
```
# 17. Sending messages to rooms
- use `getUser(socket.id)` to get the user and use `to(user.room)` in events `sendMessage` and `sendLocation`.
- Display the name of the users in the chatroom:
    - Note in `generateMessage()` and `generateLocationMessage()` function in `messages.js` the only one argument passed,
    - add another argument `username` on both,
    - access `username` in index and chat,
    - modify both `generateMessage()` and `generateLocationMessage()`,
    - in case of system send message passed in `admin` instead of `username`

# 18. Rendering User List
- left
# 19. Autoscrolling

```JavaScript

    // Public/js/chat.js
    ...
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
    ...
```
# 20. Deployment
- Create Heroku Account
- Install the Heroku CLI
- run `heroku login`
- setup ssh to securely integrate the codes:
    - `heroku keys:add`
- `git remote` checks the remote
- `git push heroku master`
