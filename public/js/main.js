import updateOnlineUsers from './modules/updateOnlineUsers.js';
import appendContainer from './modules/appendContainers.js';

// Socket io
const socket = io();

// Focus input field
document.getElementById('input').focus();

const messageContainer = document.querySelector('#messages__container');

// Ask for name
let user = prompt('What is your name?');

if (user == undefined || '' ) {
    user = 'Guest';
}

let multipleChoiceQuestion = false;

// You joined message
appendContainer.appendMessage(`You joined (${user})`, 'joined');
socket.emit('new-user', user);

// Their chat message
socket.on('their-chat-message', data => {
    console.log(data);
    appendContainer.appendMessage(`${data.user}: ${data.msg}`, 'their-message');
});

socket.on('your-chat-message', msg => {
    appendContainer.appendMessage(`${msg}`, 'your-message');
});

// User connected
socket.on('user-connected', user => {
    appendContainer.appendMessage(`${user} joined`, 'connected');
});

// User disconnected
socket.on('user-disconnected', user => {
    appendContainer.appendMessage(`${user} disconnected`, 'disconnected');
});

// Personal command executed that exist
socket.on('command-executed', (command, commands, location, celcius) => {
    appendContainer.appendMessage(`/${command}`, 'personal-command-message');

    if (command === 'commands') {
        commands = commands.join(', ');
        appendContainer.appendMessage(`Commands: ${commands}`, 'server-message');
    }
 
    if (command.includes('temp')) {
        appendContainer.appendMessage(`The current temperature in ${location} is ${celcius} degrees`, 'server-message');
    }
});

// Command executed that does not exist
socket.on('command-not-existing', commands => {
    commands = commands.join(', ');
    appendContainer.appendMessage(`command does not exist, try these instead: ${commands}`, 'error-message');
});

// Online users
socket.on('scoreboard', (users, currentRound) => {
    updateOnlineUsers(users, currentRound);
});

// Start round
socket.on('start-round', (location, answers) => {
    clearContainer();

    // If there's 1 answer (not multiple choice)
    if(answers.length == 1) {
        appendContainer.appendMessage(`Question: what is the current temperature in ${location}? (celcius)`, 'question');
    }

    // If it's a multiple choice question
    else {
        multipleChoiceQuestion = true;

        appendContainer.appendMessage(`Question: what is the current temperature in ${location}? (celcius)`, 'question', true, answers);
    
        // Click answer
        document.addEventListener('click', function(e){
            if (e.target && e.target.classList == 'answer'){
                // Send answer
                document.querySelector('#input').value = e.target.textContent;
                document.querySelector('#send').click();
                console.log('click');
            }
        });
    }
    
    // Show timer
    document.querySelector('#timer__container').setAttribute('style', 'display: flex');

    // Timer settings 9
    const duration = 9;
    const display = document.querySelector('#time');
    startTimer(duration, display);
});

// Next round
socket.on('next-round', () => {
    clearContainer();

    // Next round message
    appendContainer.appendMessage('Next round!', 'next-round');

    // Clear container after a delay
    setTimeout(() => {
        clearContainer();
    }, 2900);

    // Remove timer
    document.querySelector('#timer__container').setAttribute('style', 'display: none');
});

// Answer for the question-picker
socket.on('question-see-answer', answer => {
    appendContainer.appendMessage(`The answer is ${answer}, only you can see this`, 'server-message');
});

// Answer for the question-picker
socket.on('new-question-picker', user => {
    appendContainer.appendMessage(`${user} is the question picker! Wait for him/her to start the round!`, 'server-message');

    document.querySelector('#input').placeholder = 'Type your guess...';
    document.querySelector('#send').value = 'Guess!';
});

// Answer for the question-picker
socket.on('question-help', () => {
    appendContainer.appendMessage('You are the question picker, type /temp <location> to start the round, you can also type /multitemp <location> to start a Multiple Choice question! Example: /temp amsterdam or /multitemp amsterdam', 'server-message');

    document.querySelector('#input').placeholder = 'Type your question...';
    document.querySelector('#send').value = 'Send';
});

// User guessed the answer
socket.on('user-guessed', user => {
    appendContainer.appendMessage(`${user} guessed the answer!`, 'server-message');
});

// Game over
socket.on('game-over', users => {
    clearContainer();

    const scores = [];
    
    users.forEach(user => {
        scores.push({name: user.name, points: user.points});
    });

    // Sort on score
    // Source: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    const sortedScores = scores.sort((a, b) => (a.points < b.points) ? 1 : -1);
    console.log(sortedScores);

    appendContainer.appendScoreboard(sortedScores, 'scoreboard');

    // Add timer 14
    const duration = 14;
    const display = document.querySelector('#timer-game-over');
    startTimer(duration, display);

    // Redirect user to the homepage
    setTimeout(() => {
        window.location.pathname = '/';
    }, 15000);
});

// Errors
socket.on('error-handling', type => {
    if (type == 'round-not-started') {
        appendContainer.appendMessage('No round has been started, wait for the question-picker to start it.', 'server-message');
    }
    if (type == 'round-in-progress') {
        appendContainer.appendMessage('Wait for the round to finish!', 'server-message');
    }
    if (type == 'wait-for-next-round') {
        appendContainer.appendMessage('Wait for the next round', 'server-message');
    }
    if (type == 'already-guessed') {
        appendContainer.appendMessage('You already guessed this round!', 'server-message');
    }
    if (type == 'wrong-location') {
        appendContainer.appendMessage('This location does not exist!', 'error-message');
    }
});
//

// Send message
document.querySelector('#form').addEventListener('submit', function(event) {
    event.preventDefault();

    let msg = document.querySelector('#input').value;

    if (msg !== '') {
        const firstCharacter = msg.charAt(0);
        // Command
        if (firstCharacter === '/') {
            console.log('new command');
            msg = msg.slice(1);
            socket.emit('send-command', msg);
        }
        // Normal message
        else {
            if (multipleChoiceQuestion) {
                // Keep track of guessed multiple choice
                socket.emit('multipleChoice-guessed');
            }
            
            socket.emit('send-chat-message', msg);
        }
    }

    else {
        console.log('leeg veld');
        return false;
    }

    document.querySelector('#input').value = '';
});

// Clear container
function clearContainer() {
    messageContainer.textContent = '';
}

// Start timer for each round
function startTimer(duration, display) {
    const interval = setInterval(function () {

        // Count down
        display.textContent = duration;
        duration--;

        // If timer has reached zero
        if (duration == -1) {
            // Stop timer
            clearInterval(interval);
            console.log('end');
            // Start new round
            socket.emit('end-round');
            multipleChoiceQuestion = false;
        }
    }, 1000);
    scrollToBottom();
}

// Scroll to bottom when message is sent/received
function scrollToBottom() {
    document.querySelector('#messages__container').scrollTo(0, document.body.scrollHeight);
}