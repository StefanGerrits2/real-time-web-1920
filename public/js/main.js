const socket = io();

const messageContainer = document.querySelector('#messages__container');

// Ask for name
let name = prompt('What is your name?');

if (name == undefined) {
    name = 'Guest';
}

// You joined message
appendMessage(`You joined (${name})`, 'joined');
socket.emit('new-user', name);

// Their chat message
socket.on('their-chat-message', data => {
    appendMessage(`${data.name}: ${data.msg}`, 'their-message');
});

// Your chat message
socket.on('word-already-used', (usedWord, wordsAmount) => {
    appendMessage(`Sorry, you wrote "${usedWord}", you cannot use words that have already been used! Resetting at 50 words, current amount: ${wordsAmount}, type /words `, 'error-message');
});

socket.on('your-chat-message', msg => {
    appendMessage(`${msg}`, 'your-message');
});

// User connected
socket.on('user-connected', name => {
    appendMessage(`${name} joined`, 'connected');
});

// User disconnected
socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`, 'disconnected');
});

// Global command executed that exist
socket.on('global-command-executed', (command) => {
    document.querySelector('#messages__container').setAttribute('style', `background-color: ${command}`);
});

// Personal command executed that exist
socket.on('personal-command-executed', (command, words, commands, amount) => {
    if (command === 'commands') {
        commands = commands.join(', ');
        appendMessage(`Commands: ${commands}`, 'server-message');
    }
    if (command === 'words') {
        words = words.join(', ');
        console.log('a', words);
        appendMessage(`Used words (${amount}): ${words}`, 'server-message');
    }
});

// Command executed that does not exist
socket.on('command-not-existing', commands => {
    commands = commands.join(', ');
    appendMessage(`command does not exist, try these instead: ${commands}`, 'error-message');
});

// Online users
socket.on('online-users', amount => {
    updateOnlineUsers(amount);
});

// Send message
document.querySelector('#form').addEventListener('submit', function(event) {
    event.preventDefault();

    const msg = document.querySelector('#input').value;

    if (msg !== '') {
        const firstCharacter = msg.charAt(0);
        // Command
        if (firstCharacter === '/') {
            console.log('new command');
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
function updateOnlineUsers(amount) {
    console.log(amount);
    document.querySelector('#online-users').textContent = amount;
}