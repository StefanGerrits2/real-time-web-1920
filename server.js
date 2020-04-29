require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');

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
const shuffle = require('./modules/shuffleAnswers.js');

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
    .get('/', chooseRoom)
    .get('/game', home)

    // 404 not found
    .use(notFound);

// Keep track of game data
let gameData = {
    1: {
        activeRound: false,
        round: 0,
        correctAnswer: '',
        guessedTheAnswer: [],
        users: [],
        haveBeenQuestionPicker: [],
        haveNotBeenQuestionPicker: [],
    },

    // 2: etc
};

// Get Question Picker
let questionPicker = '';

socket.on('connection', socket => {
    // Current user
    let currentUser = {};

    // All users
    let users = gameData[1].users;

    // New user connects
    socket.on('new-user', user => {

        // Create new user
        const newUser = {
            id: socket.id,
            name: user,
            points: 0,
            role: '',
            multipleChoiceGuessed: 0
        };

        // Append role (first to connect starts with question-picker role)
        if(gameData[1].haveBeenQuestionPicker.length == 0) {
            // Question picker role
            newUser.role = 'question-picker';
            // Push into have been question picker yet
            gameData[1].haveBeenQuestionPicker.push(newUser.id);
        }  

        else {
            // Guesser role
            newUser.role = 'guesser';
            // Push into have not been question picker yet
            gameData[1].haveNotBeenQuestionPicker.push(newUser.id);
        }

        // Push new user into all users
        gameData[1].users.push(newUser);

        // Current User
        users.forEach(user => {
            if(socket.id == user.id) {
                currentUser = user;
            }
        });

        // Send chat message user connected
        socket.broadcast.emit('user-connected', user);

        // Current question picker
        getQuestionPicker();

        // Explain question picker how to pick a question
        if (currentUser.role === 'question-picker') {
            socket.emit('question-help');
        }

        else {
            socket.emit('new-question-picker', questionPicker);
        }

        // Update online users amount
        socket.broadcast.emit('scoreboard', users);
        socket.emit('scoreboard', users);

        // Update data if user joins mid game
        if (gameData[1].round !== 0) {
            socket.emit('wait-for-next-round');

            if (currentUser.role === 'guesser' && gameData[1].haveBeenQuestionPicker.length === gameData[1].round && gameData[1].activeRound === true) {

                setTimeout(() => {
                    socket.emit('question-help');
                }, 10000);

                // Make the user who joined mid game question picker
                const newQuestionPicker = gameData[1].haveNotBeenQuestionPicker[0];
                
                if (currentUser.id === newQuestionPicker) {
                    currentUser.role = 'question-picker';
                    
                    // Remove user from array
                    gameData[1].haveNotBeenQuestionPicker = gameData[1].haveNotBeenQuestionPicker.filter(e => e !== newQuestionPicker);
                    // Add user to array
                    gameData[1].haveBeenQuestionPicker.push(currentUser.id);
                }
            }
        }
        //
    });

    // Chat message
    socket.on('send-chat-message', msg => {
        // Send messages

        // If no round has been started yet
        if (!gameData[1].activeRound) {
            socket.emit('round-not-started');
        }

        else if (currentUser.multipleChoiceGuessed >= 2) {
            socket.emit('already-guessed');
        }

        // Guess the answer
        else if (
            // If you're a guesser
            currentUser.role == 'guesser' 
            // If your message is the answer
            && msg == gameData[1].correctAnswer 
            // If you have not guessed it yet
            && gameData[1].guessedTheAnswer.indexOf(currentUser.id) <= -1
        ) {

            // Add points
            currentUser.points += 100 - 10 * gameData[1].guessedTheAnswer.length;

            // Update game info
            gameData[1].guessedTheAnswer.push(currentUser.id);

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

    socket.on('multipleChoice-guessed', () => {
        // Count guessed answers per round
        currentUser.multipleChoiceGuessed++;
    });

    // Commands
    socket.on('send-command', command => {
        // Commands
        const personalCommands = ['commands', 'temp'];
        const globalCommands = ['red', 'blue', 'orange', 'yellow', 'green', 'black', 'white'];
        const tempCommand = 'temp';
        const multipleChoiceTempCommand = 'multitemp';
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
        if (
            (command.includes(tempCommand) || command.includes(multipleChoiceTempCommand))
            && currentUser.role === 'question-picker' 
            && !gameData[1].activeRound
        ) {
            // Weather API test
            async function getTemperature(location) {
                try {
                    const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.TOKEN}`;
                    const data = await Fetcher.get(url);
                    const finalData = dataHelper(data);

                    const temperature = Math.round(finalData.tempInCelcius);

                    gameData[1].correctAnswer = temperature;

                    // If multiple choice
                    let answers = [temperature];
                    // Get 3 wrong answers and put them in array.
                    if (command.includes(multipleChoiceTempCommand)) {
                        function getWrongAnswers() {

                            // Get wrong answers between 0 and 21 degrees
                            const wrongAnswer = Math.floor(Math.random() * 21);
                            if (wrongAnswer == temperature) {
                                getWrongAnswers();
                            }

                            if (answers.indexOf(wrongAnswer) > -1) {
                                getWrongAnswers();
                            }

                            else {
                                answers.push(wrongAnswer);

                                if(answers.length !== 4) {
                                    getWrongAnswers();
                                }
                            }
                        };
                        getWrongAnswers();

                        // Shuffle answers
                        answers = shuffle(answers);
                    }

                    // Update game info
                    gameData[1].round ++;
                    gameData[1].activeRound = true;
                    gameData[1].guessedTheAnswer = [];

                    // Capitalize first letter
                    location = location.charAt(0).toUpperCase() + location.substring(1);
                 
                    // Round started
                    socket.emit('start-round', location, answers);
                    socket.broadcast.emit('start-round', location, answers);

                    // Show answer to question picker
                    socket.emit('question-see-answer', temperature);
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
        // Reset round information
        gameData[1].activeRound = false;

        const userIdsInGame = gameData[1].haveNotBeenQuestionPicker.concat(gameData[1].haveBeenQuestionPicker);
        const gameOver = gameData[1].round === userIdsInGame.length;

        // End game
        if (gameOver) {
            socket.emit('game-over', users);
            
            // Save scores on database??
            //

            // Reset game data
            resetGame(1);
        }

        // Start next round
        else {
            socket.emit('next-round');

            // Reset roles if needed
            // if (gameData[1].haveNotBeenQuestionPicker.length === 0) {
            //     gameData[1].haveBeenQuestionPicker.forEach(user => {
            //         gameData[1].haveNotBeenQuestionPicker.push(user);
            //     });
            //     gameData[1].haveBeenQuestionPicker = [];
            // }

            console.log('before', gameData[1]);
            // Change question picker to guesser
            if(currentUser.role === 'question-picker') {
                currentUser.role = 'guesser';
            }

            // If role is guesser AND haveBeenQuestionPicker length is equal to round
            if (currentUser.role === 'guesser' && gameData[1].haveBeenQuestionPicker.length === gameData[1].round) {

                // Get new question picker
                const newQuestionPicker = gameData[1].haveNotBeenQuestionPicker[0];
                
                if(currentUser.id === newQuestionPicker) {
                    currentUser.role = 'question-picker';
                    
                    // Remove user from array
                    gameData[1].haveNotBeenQuestionPicker = gameData[1].haveNotBeenQuestionPicker.filter(e => e !== newQuestionPicker);
                    // Add user to array
                    gameData[1].haveBeenQuestionPicker.push(currentUser.id);
                }
            }

            console.log('after', gameData[1]);

            // Reset hasGuessed number
            currentUser.multipleChoiceGuessed = 0;

            // Current question picker
            getQuestionPicker();

            // Timeout to wait for the Next round message to disappear
            setTimeout(() => {
                // Tell the guessers who's the new question picker
                if (currentUser.role === 'guesser') {
                    socket.emit('new-question-picker', questionPicker);
                }

                // Explain question picker how to pick a question
                if (currentUser.role === 'question-picker') {
                    socket.emit('question-help', questionPicker);
                }
            }, 3000);

            // Update question picker icon after next round message
            setTimeout(() => {
                socket.broadcast.emit('scoreboard', users);
                socket.emit('scoreboard', users);
            }, 3000);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        // Send chat message user disconnected
        socket.broadcast.emit('user-disconnected', currentUser.name);

        // Remove user from users if they disconnect
        gameData[1].users = gameData[1].users.filter(item => item.id !== socket.id);

        // If person disconnects remove user from haveBeenQuestionPicker
        gameData[1].haveBeenQuestionPicker = gameData[1].haveBeenQuestionPicker.filter(item => item !== currentUser.id);

        // If everyone left the game
        if (gameData[1].users.length === 0) {
            // Reset game data
            resetGame(1);
        }

        // Update scoreboard
        socket.broadcast.emit('scoreboard', gameData[1].users);
        socket.emit('scoreboard', gameData[1].users);
    });
});

function getQuestionPicker() {
    gameData[1].users.forEach(user => {
        if(user.role === 'question-picker') {
            questionPicker = user.name;
        }
    });
}

function resetGame(room) {
    gameData[room].activeRound = false,
    gameData[room].round = 0,
    gameData[room].correctAnswer = '',
    gameData[room].guessedTheAnswer = [],
    gameData[room].users = [],
    gameData[room].haveBeenQuestionPicker = [],
    gameData[room].haveNotBeenQuestionPicker = [];
};

// Listen
server.listen(port, () => console.log(`App listening on port ${port}!`));