import express = require('express');
import http = require('http');
import socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io: socketio.Server = socketio(server);

app.use('/dist', express.static(__dirname + '/../dist'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let numUsers = 0;

io.on('connection', (socket: any) => {
    let addedUser = false;
    console.log('A user connected');

    socket.on('new user', username => {
        if (addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('chat message', message => {
        socket.broadcast.emit('chat message', {
            message: message,
            username: socket.username
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    })
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});