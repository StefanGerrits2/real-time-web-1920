const socket = io();

const messageContainer = document.querySelector('#messages__container');

let name = prompt('What is your name?');

if (name == undefined) {
    name = 'Guest';
}

appendMessage(`You joined (${name})`, 'joined');
socket.emit('new-user', name);

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.msg}`, 'their-message');
});

socket.on('user-connected', name => {
    appendMessage(`${name} joined`, 'connected');
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`, 'disconnected');
});

// Send message
document.querySelector('#form').addEventListener('submit', function(event) {
    event.preventDefault();

    const msg = document.querySelector('#input').value;

    if (msg !== '') {
        console.log('new message');
        socket.emit('send-chat-message', msg);
        appendMessage(`You: ${msg}`, 'your-message');
    }

    else {
        console.log('leeg veld');
        return false;
    }

    document.querySelector('#input').value = '';
});

function appendMessage(msg, type){
    console.log('new message detected: ' + msg);

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