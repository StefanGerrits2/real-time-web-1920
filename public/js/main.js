const socket = io();

// Focus input field
document.getElementById('input').focus();

const messageContainer = document.querySelector('#messages__container');

// Ask for name
let user = prompt('What is your name?');

if (user == undefined || '' ) {
    user = 'Guest';
}

// You joined message
appendMessage(`You joined (${user})`, 'joined');
socket.emit('new-user', user);

// Their chat message
socket.on('their-chat-message', data => {
    console.log(data);
    appendMessage(`${data.user}: ${data.msg}`, 'their-message');
});

socket.on('your-chat-message', msg => {
    appendMessage(`${msg}`, 'your-message');
});

// User connected
socket.on('user-connected', user => {
    appendMessage(`${user} joined`, 'connected');
});

// User disconnected
socket.on('user-disconnected', user => {
    appendMessage(`${user} disconnected`, 'disconnected');
});

// Global command executed that exist
socket.on('global-command-executed', (command, user) => {
    messageContainer.setAttribute('style', `background-color: ${command}`);
           
    appendMessage(`${user} changed the background to ${command}!`, 'global-command-message');
    messageContainer.setAttribute('style', `background-color: ${command}`);    
});

// Personal command executed that exist
socket.on('personal-command-executed', (command, commands, location, celcius) => {
    appendMessage(`/${command}`, 'personal-command-message');

    if (command === 'commands') {
        commands = commands.join(', ');
        appendMessage(`Commands: ${commands}`, 'server-message');
    }
 
    if (command.includes('weather')) {
        console.log(command);
        appendMessage(`The current temperature in ${location} is ${celcius} degrees`, 'server-message');
    }
});

// Command executed that does not exist
socket.on('command-not-existing', commands => {
    commands = commands.join(', ');
    appendMessage(`command does not exist, try these instead: ${commands}`, 'error-message');
});

// Wrong location
socket.on('wrong-location', () => {
    appendMessage('This location does not exist!', 'error-message');
});

// Online users
socket.on('scoreboard', users => {
    updateOnlineUsers(users);
});

// onclick start game
socket.on('start-game', () => {
    // start game
});

// Start round
socket.on('start-round', (location) => {
    appendMessage(`Question: what's the current temperature in ${location} (celcius)`, 'server-message');

    // Show timer
    document.querySelector('#timer__container').setAttribute('style', 'display: flex');

    // Timer settings
    const duration = 9;
    const display = document.querySelector('#time');
    startTimer(duration, display);
});

// Next round
socket.on('next-round', () => {
    // Next round message
    appendMessage('Next round!', 'server-message');

    // Remove timer
    document.querySelector('#timer__container').setAttribute('style', 'display: none');
});

// Answer for the question-picker
socket.on('question-see-answer', temperature => {
    appendMessage(`The answer is ${temperature}, only you can see this`, 'server-message');
});

// User guessed the answer
socket.on('user-guessed', user => {
    appendMessage(`${user} guessed the answer!`, 'server-message');
});

// Game over
socket.on('game-over', users => {
    // Show scoreboard
    appendMessage('Game over, scores:', 'server-message');

    const scores = [];
    
    users.forEach(user => {
        scores.push({name: user.name, points: user.points});
    });

    // Sort on score
    // Source: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    const sortedScores = scores.sort((a, b) => (a.points < b.points) ? 1 : -1);
    console.log(sortedScores);

    // Show sorted scores
    sortedScores.forEach(item => {
        console.log(item);
        appendMessage(`${item.name} : ${item.points}`, 'server-message');
    });

    appendTimer('server-message');

    // Add timer
    const duration = 9;
    const display = document.querySelector('#timer-game-over');
    startTimer(duration, display);

    // Redirect user to the homepage
    setTimeout(() => {
        window.location.pathname = '/';
    }, 10000);
});

// Errors
socket.on('round-not-started', () => {
    appendMessage('No round has been started, wait for the question-picker to start it.', 'server-message');
});

socket.on('round-in-progress', () => {
    appendMessage('Wait for the round to finish!', 'server-message');
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
            console.log('new message');
            socket.emit('send-chat-message', msg);
        }
    }

    else {
        console.log('leeg veld');
        return false;
    }

    document.querySelector('#input').value = '';
});

// Append chat texts
function appendMessage(msg, type){
    // Outer message div
    const outerMessage = document.createElement('div');
    outerMessage.classList.add('outer-message');
    outerMessage.classList.add(type);

    // Message text
    const newMessage = document.createElement('p');
    newMessage.classList.add('message');
    newMessage.textContent = msg;

    outerMessage.appendChild(newMessage);
    messageContainer.appendChild(outerMessage);
    scrollToBottom();
};

// Append timer redirect to home
function appendTimer(type){
    // Outer message div
    const outerMessage = document.createElement('div');
    outerMessage.classList.add('outer-message');
    outerMessage.classList.add(type);

    // Message text
    const sentence = document.createElement('p');
    sentence.textContent = 'You will be send to the homepage in';

    const timer = document.createElement('p');
    timer.id = 'timer-game-over';
    timer.textContent = '10';

    const seconds = document.createElement('p');
    seconds.textContent = 'seconds';

    outerMessage.appendChild(sentence);
    outerMessage.appendChild(timer);
    outerMessage.appendChild(seconds);
    messageContainer.appendChild(outerMessage);
    scrollToBottom();
};

// Scroll to bottom when message is sent/received
function scrollToBottom() {
    document.querySelector('#messages__container').scrollTo(0, document.body.scrollHeight);
}

// Update online user amount
function updateOnlineUsers(users) {
    // Reset
    document.querySelector('#scores').textContent = '';

    // Sort on score
    // Source: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    const sortedScores = users.sort((a, b) => (a.points < b.points) ? 1 : -1);

    let number = 0;

    // Reappend 
    sortedScores.forEach(user => {
        number++;

        // Super container
        const superContainer = document.createElement('div');
        superContainer.id = 'supercontainer';

        // Text container
        const leftContainer = document.createElement('div');
        leftContainer.id = 'user-number__container';

        // Text container
        const middleContainer = document.createElement('div');
        middleContainer.id = 'user-points__container';

        // Icon container
        const rightContainer = document.createElement('div');
        rightContainer.id = 'icon__container';

        if (user.role === 'question-picker') {
            const icon = document.createElement('img');
            icon.src = 'images/think.png';
            rightContainer.appendChild(icon);
        }

        const name = document.createElement('p');
        const points = document.createElement('p');
        const place = document.createElement('p');

        name.textContent = user.name;
        points.textContent = 'Points: ' + user.points;
        place.textContent = '#' + number;

        leftContainer.appendChild(place);

        middleContainer.appendChild(name);
        middleContainer.appendChild(points);

        superContainer.appendChild(leftContainer);
        superContainer.appendChild(middleContainer);
        superContainer.appendChild(rightContainer);

        document.querySelector('#scores').appendChild(superContainer);
    });
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
        }
    }, 1000);
    scrollToBottom();
}