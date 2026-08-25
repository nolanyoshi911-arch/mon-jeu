const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {}; // id -> { x, y }

io.on('connection', (socket) => {
    console.log('Nouveau joueur:', socket.id);

    // Initialiser le joueur avec une position aléatoire
    players[socket.id] = {
        x: Math.random() * 700,
        y: Math.random() * 500
    };

    // Envoyer la liste des joueurs au nouveau
    socket.emit('players', players);

    // Informer les autres de l'arrivée
    socket.broadcast.emit('newPlayer', {
        id: socket.id,
        ...players[socket.id]
    });

    // Réception d'un mouvement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y
            });
        }
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log('Joueur déconnecté:', socket.id);
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Serveur démarré sur le port ' + (process.env.PORT || 3000));
});
