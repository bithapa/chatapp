# chatapp
---
## TOC
- [x] 0. Files Tree
- [x] 1. Setting thins up!
---
# 0. Files Tree:

```
    chatapp
        |-src
        |   |-index.js
        |-public
        |   |-index.html
        |-package-lock.json
        |-package.json
        |-README.json
```
---
# 1. Setting things up

1. initialize the NodeJS project:
    - create chatapp folder and run `npm init`, all the values can be default
2. Build a Node server:

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

3. Setup `public` directory:
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

4. Setup Script

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
                    to run the project: npm run start
            to run in development mode: npm run dev
```
