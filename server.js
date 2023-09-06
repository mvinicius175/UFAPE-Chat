const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getUser, userLeft, getRoomUsers } = require("./utils/users");

const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Seta a pasta public como estática
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Bot"

// Inicia quando um cliente conecta
io.on("connection", socket => {
    socket.on("joinRoom", ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Mensagem emitida quando um cliente se conecta
        socket.emit("message", formatMessage(botName, "Bem vindo ao UFAPE Chat!"));

        // Broadcast para todos quando um usuário se conecta
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} entrou no chat`));

        // Envia informações de sala e usuários
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // 'Listen' por 'chatMessage'
    socket.on("chatMessage", msg => {
        const user = getUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // Roda quando um cliente desconecta
    socket.on("disconnect", () => {
        const user = userLeft(socket.id);

        if(user)
        {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} saiu da sala`));

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
});
