//make a new server
const express = require('express');
const app = express();
const {v4: uuidv4} = require('uuid');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
    
})
app.use(express.static('public'));
app.use('/peerjs', peerServer);
app.get('/:room',(req,res) => {
    res.render('room', {roomId: req.params.room});
})

// console.log(__dirname + '/public');
server.listen(process.env.PORT || 8888, () => {
    console.log('Example app listening on port 8888!');
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId);
        socket.join(roomId);
        // socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.broadcast.emit('user-connected', userId) 

        socket.on('message', message =>{
            io.to(roomId).emit('createMessage', message);
        })

    })
   
});
