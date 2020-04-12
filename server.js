require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);

const minifyHTML = require('express-minify-html-2');
const compression = require('compression');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, './public/');

// Controllers
const home = require('./routes/home.js');
const notFound = require('./routes/notFound.js');

app
    .set('view engine', 'hbs')
    .engine( 'hbs', hbs( {
        extname: 'hbs',
        defaultLayout: 'main',
        partialsDir: __dirname + '/views/partials/'
    }))
    
    .use(compression())
    .use('/', express.static(publicPath))

    .use(minifyHTML({
        override: true,
        exception_url: false,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            minifyJS: true
        }
    }))

    // Get routes
    .get('/', home)

    // 404 not found
    .use(notFound);

const users = {};
const sentMessages = [];

const getOnlineUsers = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

socket.on('connection', socket => {
    // Chat message
    socket.on('send-chat-message', msg => {
        // Save all sent words
        const newWords = msg.split(' ');
        console.log('new words', newWords);

        // Check for every sent word
        let newWordStatus = false;

        newWords.forEach(newWord => {
            newWord = newWord.toLowerCase();

            if (sentMessages.includes(newWord)) {
                console.log('woord bestaat al');
                socket.emit('word-already-used', newWord, sentMessages.length);

                newWordStatus = true;
            }
        });

        // Check status
        if(!newWordStatus) {
            console.log('nieuw woord');
            // Push new words into sent Messages
            newWords.forEach(newWord => {
                newWord = newWord.toLowerCase();
                sentMessages.push(newWord);
            });

            // When the amount of unique sent messages is above 50, reset the words
            if (sentMessages.length > 50) {
                sentMessages = [];
            }

            // Send messages
            socket.broadcast.emit('their-chat-message', { msg: msg, user: users[socket.id] });
            socket.emit('your-chat-message', msg);
        }

        console.log('sent messages', sentMessages);
    });

    // New user connects
    socket.on('new-user', user => {
        // Send chat message user connected
        users[socket.id] = user;
        socket.broadcast.emit('user-connected', user);

        // Update online users amount
        const onlineUsers = getOnlineUsers(users);
        socket.broadcast.emit('online-users', onlineUsers);
        socket.emit('online-users', onlineUsers);
    });

    // Commands
    socket.on('send-command', command => {
        const user = users[socket.id];

        const personalCommands = ['/words', '/commands'];
        const globalCommands = ['/rickroll', '/red', '/blue', '/orange', '/yellow', '/green', '/black', '/white'];
        const allCommands = personalCommands.concat(globalCommands);

        // If personal command exists
        if (personalCommands.indexOf(command) > -1) {
            const commandText = command.slice(1);
            socket.emit('personal-command-executed', commandText, sentMessages, allCommands, sentMessages.length);
            return;
        }
        // If global command exists
        if (globalCommands.indexOf(command) > -1) {
            const commandText = command.slice(1);
            socket.emit('global-command-executed', commandText, user);
            socket.broadcast.emit('global-command-executed', commandText, user);
            return;
        }

        // If command does not exist
        else {
            socket.emit('command-not-existing', allCommands);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        // Send chat message user disconnected
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];

        // Update online users amount
        const onlineUsers = getOnlineUsers(users);
        socket.broadcast.emit('online-users', onlineUsers);
        socket.emit('online-users', onlineUsers);
    });
});

// Spotify API test.
async function getData() {
    // Default options are marked with *
    fetch('https://api.spotify.com/v1/users/usernamehere', {
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
        }
    })
        .then(response => response.json())
        .then(data => console.log(data));

}

getData();

// Listen
server.listen(port, () => console.log(`App listening on port ${port}!`));