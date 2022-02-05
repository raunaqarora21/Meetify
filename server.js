//make a new server
const express = require('express');
const app = express();
const {v4: uuidv4} = require('uuid');
const server = require('http').Server(app);
const cors = require('cors');
const io = require('socket.io')(server, 
    {
        cors:{
            origin: '*',
            methods: 'GET, POST',

        }
    }
);    

app.use(cors());
    

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
    allowDiscovery: true
});
const user = require("./db/schemas/user.js");
const bodyParser = require('body-parser');
const videoRoom = require("./routes/video.js");
// require('./db/conn');
const mongoose = require("mongoose");

const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const index = require('./routes/index.js');
const initializePassport = require('./passport-config');
initializePassport(passport, 
  user
    );
const bcrypt = require('bcrypt');

app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(require("express-ejs-layouts"));
app.set("layout", "layouts/layout");

const cookie = require("cookie-session");


app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.post("/join-room", (req, res) => {
    res.redirect(`/${req.body.room_id}`);
});

app.get('/auth', (req,res) => {
    res.render('auth.ejs');
})



// app.use(cookie({ maxAge: 30 * 24 * 60 * 60 * 1000, keys: ["raunaq"] }));


const signup = require("./routes/auth/register");
const login = require("./routes/auth/login");
const logout = require("./routes/auth/logout");

const newMeeting = require("./routes/newMeeting");
const peerUser = require('./db/schemas/peerUser.js');
const room = require("./db/schemas/room.js");

app.use(express.static('public'));
app.use('/peerjs', peerServer);
// app.get('/:room',(req,res) => {
//     res.render('room', {roomId: req.params.room});
// })
// app.get('/', (req, res) => {
//     res.render('index.ejs');
//     });


//logout page
app.use("/logout", logout);

// login
app.use("/login", login);

// signup
app.use("/register", signup);
// console.log(__dirname + '/public');
app.get("/user", async (req, res) => {
    res.json({
        user: await peerUser.findOne({ peerId: req.query.peer }).exec(),
    });
});
server.listen(process.env.PORT || 8888, () => {
    console.log('Example app listening on port 8888!');
});

app.use("/new-meeting", newMeeting);

app.use("/", videoRoom); 

app.use("/", index); 

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/meetify', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
}).then(() => {
  
    console.log('Connected to Database');
}
).catch((err) => {
    console.log('Connection Failed', err);
}
);





io.on('connection', (socket) => {
    socket.on('join-room', 
    async(roomId, peerId, userId, name, audio, video) => {
        // console.log(roomId, peerId, userId, name, audio, video);
        try{
            console.log("join room called");
            await peerUser({
                peerId: peerId,
                name: name,
                audio: audio,
                video: video,
            }).save();
            //Add Room Details
            var roomData = await room.findOne({
                roomId: roomId,
          
            }).exec();
            // console.log(roomData);
            if (roomData == null) {
                await room({
                    roomId: roomId,
                    userId: userId,
                    count: 1,
                }).save();
                roomData = { count: 0 };
            } else if (roomData.userId == userId) {
                await room.updateOne(
                    { roomId: roomId },
                    { count: roomData.count + 1 }
                );
            }
          
           
            socket.join(roomId);
            console.log(roomId);
        
            socket
                .to(roomId)
                .emit(
                    "user-connected",
                    peerId,
                    name,
                    audio,
                    video,
                    roomData.count + 1
                );

        socket.on("disconnect", async () => {
            roomData = await room.findOne({ roomId: roomId }).exec();
            await room.updateOne(
                { roomId: roomId },
                { count: roomData.count - 1 }
            );
            // remove peer details
            await peerUser.deleteOne({ peerId: peerId });
            socket
                .to(roomId)
                .emit(
                    "user-disconnected",
                    peerId,
                    roomData.count - 1
                );
        });

        socket.on('message', message =>{
            
            io.to(roomId).emit('createMessage', message);
        })
        socket.on("client-send", (data) => {
            socket.to(roomId).emit("client-podcast", data, name);
        });
        }
        catch(err){
            console.log(err);
        }

        

     

       
        

    })
   
});


