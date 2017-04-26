'use strict'
const http = require('http')
const express = require('express')
const MongoClient = require('mongodb')
const mongodbURL = 'mongodb://192.168.0.100:12345/OrderUs'
const assert = require('assert');
const PORT = 80

const app = express()
app.set('port', process.env.PORT || PORT)
app.set('view engine', 'pug')
app.use(express.static('public'))

const server = http.createServer(app).listen(PORT, () => {
    console.log('OrderUs server listening on port ' + PORT)
})

app.get('/', (req, res) => {
    res.end('Hello :)')
    // res.render('index')
})

const srvIO = require('socket.io')(server)
let socketID_sockets_pairs = {}

function sendMessageToAll(exceptID, messageTag, message) {
    for (let socketID in socketID_sockets_pairs) {
        if (socketID !== exceptID) {
            socketID_sockets_pairs[socketID].emit(messageTag, message)
        }
    }
}

MongoClient.connect(mongodbURL, (err, db) => {
    if (err) {
        console.log('Error occured connecting the database')
    } else {
        console.log("Connected correctly to server.")
    }

    srvIO.on('connect', socket => {
        console.log('client connected');

        socket.on('dataNeedsToBeReloaded', data => {
            socket.emit('dataNeedsToBeReloaded', true)
        })

        socket.on('itemsList', data => {
            console.log('sending items list');
            db.collection('Items').find().toArray((err, items) => {
                let modifiedItems = items.map(item => {
                    let lastestPrice = item.priceTrends[item.priceTrends.length - 1]
                    item.price = lastestPrice
                    delete item.priceTrends
                    return item
                })
                console.log(modifiedItems);
                socket.emit('itemsList', modifiedItems)
                console.log('items sent');
            })
        })

        socket.on('categoriesList', data => {
            console.log('sending categories list');
            db.collection('Categories').find().toArray((err, categories) => {
                console.log(categories);
                socket.emit('categoriesList', categories)
                console.log('categories sent');
            })
        })

        socket.on('userInfo', userInfo => {
            userInfo.id = socket.id
            socketID_sockets_pairs[socket.id].userInfo = userInfo
            // sendMessageToAll(socket.id, 'userConnectNotification', userInfo)
        })

        socket.on('newOrder', orderDetails => {
            console.log(orderDetails);
        })

        socket.on('disconnect', () => {
            // sendMessageToAll(socket.id, 'userDisconnectNotification', socketID_sockets_pairs[socket.id].userInfo)
            delete socketID_sockets_pairs[socket.id]
        })
    })

})
