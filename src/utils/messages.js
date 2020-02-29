// function that takes the message (txt) as an argument and
// returns the object with txt and timestamp (createdAt) as properties

const generateMessage = (username, txt) => {
    return {
        username,
        txt,
        createdAt: new Date().getTime()
    }
}

// fucntion that takes the google location link as an argument and returns
// the object with link and the timestamp

const generateLocationMessage = (username, position) => {
    return {
        username, 
        url: `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}
