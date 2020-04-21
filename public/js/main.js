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
socket.on('online-users', users => {
    updateOnlineUsers(users);
});

// onclick start game
socket.on('start-game', () => {
    // start game
});

// onclick nextround button
socket.on('next-round', () => {
    // next round
});

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

// Scroll to bottom when message is sent/received
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

// Update online user amount
function updateOnlineUsers(users) {
    // Reset
    document.querySelector('#scores').textContent = '';

    // Reappend 
    users.forEach(user => {
        // Super container
        const superContainer = document.createElement('div');
        superContainer.id = 'supercontainer';

        // Textr container
        const leftContainer = document.createElement('div');
        leftContainer.id = 'user-points__container';

        // Icon container
        const rightContainer = document.createElement('div');
        rightContainer.id = 'icon__container';

        if (user.role === 'question-asker') {
            console.log('questrion-asker');
            const icon = document.createElement('img');
            icon.src = 'images/question-picker.svg';
            rightContainer.appendChild(icon);
        }

        const name = document.createElement('p');
        const points = document.createElement('p');

        name.textContent = user.name;
        points.textContent = 'Points: ' + user.score;

        leftContainer.appendChild(name);
        leftContainer.appendChild(points);

        superContainer.appendChild(leftContainer);
        superContainer.appendChild(rightContainer);

        document.querySelector('#scores').appendChild(superContainer);
    });
}