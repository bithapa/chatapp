/*
users[]
    - addUser()
    - removeUser()
    - getUser()
    - getUsersInRoom()
*/

const users = []

// function: addUser()
// @param:
//      id:         num/int
//      username:   string
//      room:       string
// takes a user object {,,}, cleans and validates the data and if the user
// doesn't exist already, stores in the users[], and
// returns the same user object
const addUser = ( { id, username, room} ) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data:
    // check id the username and room are provided
    if ( !username || !room ) {
        return {
            error: 'Username and room are required!'
        }
    }
    // check the user doesn't exist already in the array
    const userExists = users.find( (user) => {
        return user.username === username && user.room === room
    })
    if(userExists) {
        return {
            error: 'Username already in use!'
        }
    }

    // store the data
    const user = { id, username, room }
    users.push(user)

    // return the user object
    return { user }
}

// function: removeUser(id)
// removes a user with the given id,
// and returns the removed user object
const removeUser = (id) => {
    // iterate over the users[] to find the matching user
    // index = -1 if not found, else 1
    const index = users.findIndex((user) => user.id === id)

    if ( index != -1) {
        // users.splice(index, 1) is an array of objects that are
        // removed from the users[] array; however, since we are removing
        // only one `(index, 1)` object [o] is provided at the end
        return users.splice(index, 1)[0]
    }
    // return {
    //     error: 'User doesn\'t exist!'
    // }
}

// function: getUser(id)
//  @param:
//      id: string
// returns the user object of given id
const getUser = (id) => {
    // returns undefined if not matched
    return users.find((user) => user.id === id)
}

// funtion: getUsersInRoom(room)
//  @param:
//      room: string
// returns all the users object of given room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

// const user1 = {
//     id: 1,
//     username: 'user1',
//     room: 'room1'
// }
// const user2 = {
//     id: 2,
//     username: 'user2',
//     room: 'room1'
// }
// addUser(user1)
// addUser(user2)
// console.log(getUsersInRoom('Room1'))

module.exports = {
        addUser,
        removeUser,
        getUser,
        getUsersInRoom
}
