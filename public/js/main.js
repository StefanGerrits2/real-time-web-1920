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
socket.on('word-already-used', usedWord => {
    appendMessage(`Sorry, you wrote "${usedWord}", you cannot use words that have already been used!`, 'error-message');
});

socket.on('your-chat-message', msg => {
    appendMessage(`You: ${msg}`, 'your-message');
});

// User connected
socket.on('user-connected', name => {
    appendMessage(`${name} joined`, 'connected');
});

// User disconnected
socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`, 'disconnected');
});

// Command executed that exist
socket.on('command-executed', color => {
    document.querySelector('#messages__container').setAttribute('style', `background-color: ${color}`);
});

// Command executed that does not exist
socket.on('command-not-existing', commands => {
    appendMessage(`command does not exist, try these instead: ${commands}`, 'error-message');
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

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}