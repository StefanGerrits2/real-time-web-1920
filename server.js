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
// const startTimer = require('./modules/startTimer.js');

// Controllers
const home = require('./routes/home.js');
const chooseRoom = require('./routes/chooseRoom.js');
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
    .get('/chooseRoom', chooseRoom)

    // 404 not found
    .use(notFound);

// Save current online users
let users = [];

// Keep track of game data
let gameData = {
    1: {
        haveBeenQuestionPicker: [],
        haveNotBeenQuestionPicker: [],
        correctAnswer: '',
        round: 0,
        activeRound: false,
        guessedTheAnswer: [],
    },

    // 2: etc
};

socket.on('connection', socket => {
    let currentUser = {};

    // New user connects
    socket.on('new-user', user => {
        
        // Create new user
        const newUser = {
            id: socket.id,
            name: user,
            points: 0,
            role: '',
        };

        // Append role (first to connect starts with question-picker role)
        if(gameData[1].haveBeenQuestionPicker.length == 0) {
            console.log('role is question picker');
            // Question picker role
            newUser.role = 'question-picker';
            // Push into have been question picker yet
            gameData[1].haveBeenQuestionPicker.push(newUser.id);
        }  
        else {
            console.log('role is guesser');
            // Guesser role
            newUser.role = 'guesser';
            // Push into have not been question picker yet
            gameData[1].haveNotBeenQuestionPicker.push(newUser.id);
        }

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
        socket.broadcast.emit('scoreboard', users);
        socket.emit('scoreboard', users);

        // console logs -> REMOVE LATER
        console.log('users', users);
        console.log('game data', gameData);
    });

    // Chat message
    socket.on('send-chat-message', msg => {
        // Send messages

        // If no round has been started yet
        if (!gameData[1].activeRound) {
            socket.emit('round-not-started');
        }

        // Guess the answer
        else if (
            // If you're a guesser
            currentUser.role == 'guesser' 
            // If your message is the answer
            && msg == gameData[1].correctAnswer 
            // If you have not guessed it yet
            && gameData[1].guessedTheAnswer.indexOf(currentUser.id) <= -1) {

            // Add points
            currentUser.points += 100 - 10 * gameData[1].guessedTheAnswer.length;
            console.log(users);

            // Update game info
            gameData[1].guessedTheAnswer.push(currentUser.id);
            console.log('game data', gameData);

            // Emit that you guessed it
            socket.emit('user-guessed', currentUser.name);
            socket.broadcast.emit('user-guessed', currentUser.name);

            // Emit scores
            socket.broadcast.emit('scoreboard', users);
            socket.emit('scoreboard', users);
        }

        // If you already guessed the answer in the current round
        else if (gameData[1].guessedTheAnswer.indexOf(currentUser.id) > -1 || currentUser.role == 'question-picker') {
            socket.emit('round-in-progress');
        }

        // Normal chat message
        else {
            socket.broadcast.emit('their-chat-message', { msg: msg, user: currentUser.name });
            socket.emit('your-chat-message', msg);
        }
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
        else if (personalCommands.indexOf(command) > -1) {
            socket.emit('personal-command-executed', command, allCommands);
            return;
        }

        // If global command exists
        if (globalCommands.indexOf(command) > -1) {
            socket.emit('global-command-executed', command, currentUser.name);
            socket.broadcast.emit('global-command-executed', command, currentUser.name);
            return;
        }

        // Start round
        if (command.includes(weatherCommand) && currentUser.role === 'question-picker' && !gameData[1].activeRound) {
            console.log('aaaa');
            // Weather API test
            async function getTemperature(location) {
                try {
                    const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.TOKEN}`;
                    const data = await Fetcher.get(url);
                    const finalData = dataHelper(data);
                    const temperature = Math.round(finalData.tempInCelcius);

                    gameData[1].correctAnswer = temperature;
                    console.log('correct answer is', gameData[1].correctAnswer);

                    // Update game info
                    gameData[1].round ++;
                    gameData[1].activeRound = true;
                    gameData[1].guessedTheAnswer = [];

                    // Round started
                    socket.emit('start-round', location);
                    socket.broadcast.emit('start-round', location);

                    // Show answer to question picker
                    socket.emit('question-see-answer', temperature);

                    console.log('game data', gameData);
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

    // Start game
    socket.on('start-game', () => {
        //
    });

    // Next round
    socket.on('end-round', () => {
        console.log('round endeddd');
        // Reset round information
        gameData[1].activeRound = false;

        const gameOver = gameData[1].round === gameData[1].haveNotBeenQuestionPicker.concat(gameData[1].haveBeenQuestionPicker).length;

        // End game
        if (gameOver) {
            socket.broadcast.emit('game-over');
        }

        // Start next round
        else {
            socket.broadcast.emit('next-round');

            // Reset roles if needed
            // if (gameData[1].haveNotBeenQuestionPicker.length === 0) {
            //     gameData[1].haveBeenQuestionPicker.forEach(user => {
            //         gameData[1].haveNotBeenQuestionPicker.push(user);
            //     });
            //     gameData[1].haveBeenQuestionPicker = [];
            // }

            console.log(gameData[1]);

            // Change question picker to guesser
            if(currentUser.role === 'question-picker') {
                gameData[1].haveBeenQuestionPicker.forEach(questionPickers => {
                    users.forEach(user => {
                        if(user.id == questionPickers) {
                        // Change role
                            user.role = 'guesser';
                        }
                    });
                });
            }

            const newQuestionPicker = gameData[1].haveNotBeenQuestionPicker[0];

            // If role is guesser, and you're the new question-picker
            if (currentUser.role === 'guesser' && currentUser.id == newQuestionPicker) {
            // Change a guesser to question picker

                console.log('new picker', newQuestionPicker);
                users.forEach(user => {
                    if(user.id === newQuestionPicker) {
                        user.role = 'question-picker';
                    
                        // Remove user from array
                        gameData[1].haveNotBeenQuestionPicker = gameData[1].haveNotBeenQuestionPicker.filter(e => e !== newQuestionPicker);
                        // Add user to array
                        gameData[1].haveBeenQuestionPicker.push(user.id);
                    }
                });
            }

            // Emit scores
            socket.broadcast.emit('scoreboard', users);
            socket.emit('scoreboard', users);
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
        socket.broadcast.emit('scoreboard', users);
        socket.emit('scoreboard', users);

        // If person disconnects remove user from havebeenquestionpicker
        gameData[1].haveBeenQuestionPicker = gameData[1].haveBeenQuestionPicker.filter(item => item !== currentUser.id);
    });
});

// Listen
server.listen(port, () => console.log(`App listening on port ${port}!`));