// load express
const express = require('express') // v14.6.4
const path = require('path') // node module
const http = require('http')

const app = express() // initialize the express app
const server = http.createServer(app)

// calls from environment variable or port 3000
const port = process.env.PORT || 3000 // enable the port address

// main folder/source to render
const publicDirectoryPath = path.join(__dirname, '../public')

// use express static middleware to setup the server
app.use(express.static(publicDirectoryPath))

// listening to the port

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
