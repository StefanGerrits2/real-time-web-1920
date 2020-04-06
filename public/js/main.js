const socket = io();

const name = prompt('What is your name?');
appendMessage('You joined');
socket.emit('new-user', name);

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.msg}`);
});

socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
});

// Send message
document.querySelector('#form').addEventListener('submit', function(event) {
    event.preventDefault();

    const msg = document.querySelector('#input').value;

    if (msg !== '') {
        console.log('new message');
        socket.emit('send-chat-message', msg);
        appendMessage(`You: ${msg}`);
    }

    else {
        console.log('leeg veld');
        return false;
    }

    document.querySelector('#input').value = '';
});

function appendMessage(msg){
    console.log('new message detected: ' + msg);
    const newMessage = document.createElement('p');
    newMessage.classList.add('message');
    newMessage.textContent = msg;

    document.querySelector('#messages__container').appendChild(newMessage);
};