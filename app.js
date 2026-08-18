require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const DBCon = require('./app/config/db');
const cors = require('cors')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const passport = require("passport");
const logger = require('./app/utils/logger');
const flash = require("connect-flash");

require("./app/config/passport");


const app = express();

const server = http.createServer(app);
const io = new Server(server);

DBCon();

app.use(cors())

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))


app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.set("io", io);

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

const apiRouter = require('./app/routes');
app.use(apiRouter);


const chatController =
    require("./app/controller/chat.controller");

io.on("connection", (socket) => {

    logger.info(`Socket connected: ${socket.id}`);

    socket.on("policeOnline", (policeId) => {

        if (!policeId) {
            logger.warn("Police ID not received");
            return;
        }

        const room = `police_${policeId.toString()}`;

        console.log("app.js room", room);


        socket.join(room);

        logger.info(`Police ${policeId} joined room ${room}`);
    });

    socket.on("joinCaseChat", ({ caseId, userId }) => {

        const roomName = `case_${caseId}`;

        socket.join(roomName);

        console.log(`User ${userId} joined ${roomName}`);
    });

    socket.on("sendCaseMessage", async (data) => {
        try {
            const {
                caseId,
                senderId,
                senderModel,
                message
            } = data;

            if (!caseId || !senderId || !message) {
                return socket.emit("chatError", {
                    message: "Invalid message data."
                });
            }

            const savedMessage =
                await chatController.sendCaseMessage({
                    caseId,
                    senderId,
                    senderModel,
                    message
                });

            io.to(`case_${caseId}`).emit(
                "newCaseMessage",
                savedMessage
            );

        } catch (error) {
            console.error("Send case message error:", error);

            socket.emit("chatError", {
                message: "Unable to send message."
            });
        }
    });


    socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });

});

const PORT = 3006;

server.listen(PORT, () => {

    logger.info(`server is running on http://localhost:3006/abhaya/`);
})

