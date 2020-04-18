require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
require('dotenv').config();

const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);

const minifyHTML = require('express-minify-html-2');
const compression = require('compression');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, './public/');

// Modules
const dataHelper = require('./modules/dataHelper.js');
const Fetcher = require('./modules/fetch.js');
const getOnlineUsers = require('./modules/getOnlineUsers.js');

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

// Save current online users
let users = [];

socket.on('connection', socket => {
    let currentUser = {};
    // New user connects
    socket.on('new-user', user => {
        
        // Create new user
        const newUser = {
            id: '',
            name: '',
            score: 0,
            type: '',
        };

        newUser.id = socket.id;
        newUser.name = user;
        newUser.score = 0;

        // Push new user into all users
        users.push(newUser);

        // Current User
        users.forEach(user => {
            if(socket.id == user.id) {
                currentUser = user;
            }
        });

        // Send chat message user connected
        socket.broadcast.emit('user-connected', user);

        // Update online users amount
        const onlineUsers = getOnlineUsers(users);
        socket.broadcast.emit('online-users', onlineUsers);
        socket.emit('online-users', onlineUsers);

        console.log(users);
    });

    // Chat message
    socket.on('send-chat-message', msg => {
        // Send messages
        socket.broadcast.emit('their-chat-message', { msg: msg, user: currentUser.name });
        socket.emit('your-chat-message', msg);
    });

    // Commands
    socket.on('send-command', command => {
        // Commands
        const personalCommands = ['commands', 'weather'];
        const globalCommands = ['red', 'blue', 'orange', 'yellow', 'green', 'black', 'white'];
        const weatherCommand = 'weather';
        const allCommands = personalCommands.concat(globalCommands);

        let location = '';

        // Get location
        if (command.split(' ').length > 1) {
            location = command.split(' ').slice(1).join(' ');
        }

        // If personal command exists
        if (personalCommands.indexOf(command) > -1) {
            socket.emit('personal-command-executed', command, allCommands);
            return;
        }

        // If global command exists
        if (globalCommands.indexOf(command) > -1) {
            socket.emit('global-command-executed', command, currentUser.name);
            socket.broadcast.emit('global-command-executed', command, currentUser.name);
            return;
        }

        if (command.includes(weatherCommand)) {
            // Weather API test
            async function getTemperature(location) {
                try {
                    const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.TOKEN}`;
                    const data = await Fetcher.get(url);
                    console.log(data);
                    const finalData = dataHelper(data);
                    console.log(finalData);
                    const temperature = Math.round(finalData.tempInCelcius);
                    socket.emit('personal-command-executed', command, allCommands, location, temperature);
                }

                catch(err) {
                    socket.emit('wrong-location');
                }
            }
            getTemperature(location);
        }

        // If command does not exist
        else {
            socket.emit('command-not-existing', allCommands);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        // Send chat message user disconnected
        socket.broadcast.emit('user-disconnected', currentUser.name);

        // Remove user from users if they disconnect
        users = users.filter(item => item.id !== socket.id);
        console.log(users);

        // Update online users amount
        const onlineUsers = getOnlineUsers(users);
        socket.broadcast.emit('online-users', onlineUsers);
        socket.emit('online-users', onlineUsers);
    });
});

// Listen
server.listen(port, () => console.log(`App listening on port ${port}!`));