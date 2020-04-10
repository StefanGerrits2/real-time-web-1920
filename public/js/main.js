const socket = io();

const messageContainer = document.querySelector('#messages__container');

// Ask for name
let user = prompt('What is your name?');

if (user == undefined) {
    user = 'Guest';
}

// You joined message
appendMessage(`You joined (${user})`, 'joined');
socket.emit('new-user', user);

// Their chat message
socket.on('their-chat-message', data => {
    appendMessage(`${data.user}: ${data.msg}`, 'their-message');
});

// Your chat message
socket.on('word-already-used', (usedWord, wordsAmount) => {
    appendMessage(`Sorry, you wrote "${usedWord}", you cannot use words that have already been used! Resetting at 50 words, current amount: ${wordsAmount}, type /words `, 'error-message');
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

const audio = new Audio('/audio/rickroll.mp3');

// Global command executed that exist
socket.on('global-command-executed', (command, user) => {
    if (command === 'rickroll') {
        appendMessage(`${user} actived a rick roll!`, 'global-command-message');

        // Set audio volume
        audio.volume = 0.03;

        // Change background image
        messageContainer.setAttribute('style', 'background-image: url(https://media1.tenor.com/images/23aeaaa34afd591deee6c163c96cb0ee/tenor.gif?itemid=7220603)');

        // Check if audio is playing
        if (!isPlaying()) {
            audio.play();

            // Stops audio and change background after given time
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                messageContainer.setAttribute('style', 'background-image: initial)');
            }, 10000);  
        
        }
    }

    else {
        if (!isPlaying()) {
            appendMessage(`${user} changed the background to ${command}!`, 'global-command-message');
            messageContainer.setAttribute('style', `background-color: ${command}`);
        }

        else {
            appendMessage('Please wait till rick has stopped rolling! ', 'server-message');
        }
    }
});

// Personal command executed that exist
socket.on('personal-command-executed', (command, words, commands, amount) => {
    appendMessage(`/${command}`, 'personal-command-message');

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
    document.querySelector('#online-users').textContent = amount;
}

// Check if audio is playing https://stackoverflow.com/questions/9437228/html5-check-if-audio-is-playing
const isPlaying = function () {
    return audio
        && audio.currentTime > 0
        && !audio.paused
        && !audio.ended
        && audio.readyState > 2;
};