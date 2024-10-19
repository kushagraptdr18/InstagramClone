const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(cookieParser());

require("dotenv").config();
const db = require("./config/mongoose-connection")

const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const userModel = require('./models/userModel');
const chatModel = require('./models/chatModel');


io.on("connection", function(socket) {
    // Mark the user as online in the database
    socket.on("userId", async function(user) {
        await userModel.findOneAndUpdate(
            { _id: user },
            { $set: { isOnline: "1" } }
        );
        socket.broadcast.emit("online", user);

        socket.on("disconnect", async function() {
            await userModel.findOneAndUpdate(
                { _id: user },
                { $set: { isOnline: "0" } }
            );
            socket.broadcast.emit("offline", user);
        });
    });

    // Handle new messages
    socket.on("userMessage", function(chatData) {
        socket.broadcast.emit("oppoMessage", chatData);
    });

    // Handle loading previous chat history
    socket.on("loadChat", async function(data) {
        let chat = await chatModel.find({
            $or: [
                { sender_Id: data.sender_id, receiver_Id: data.receiver_id },
                { sender_Id: data.receiver_id, receiver_Id: data.sender_id }
            ]
        });
        socket.emit("previousChat", chat);
    });
});






const indexRouter = require('./routes/indexRouter');

app.use('/', indexRouter);





server.listen(3000, () => {
    console.log('Server running on port 3000');
});